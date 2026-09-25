// Copyright 2026 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Package pspclient holds the PSP-agnostic parts of the Google Pay PSP
// client: the Order model, its normalization/validation, and the ISO
// currency precision table. Each PSP handler lives in the handlers
// subpackage and calls Normalize before doing its own PSP-specific work.
package pspclient

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

// BillingAddress is the shipping/billing address supplied by the Google Pay
// API's PaymentData response.
type BillingAddress struct {
	Address1 string
	Address2 string
	Address3 string
	// Street is populated by Normalize by joining Address1-3.
	Street string
}

// TokenizationData holds the raw Google Pay payment token, as returned by
// the Google Pay API before it's parsed into PaymentToken.
type TokenizationData struct {
	Token string
}

// PaymentMethodInfo carries the billing address associated with the
// payment method the shopper chose.
type PaymentMethodInfo struct {
	BillingAddress *BillingAddress
}

// PaymentMethodData is the payment-method-specific portion of a Google Pay
// PaymentData response.
type PaymentMethodData struct {
	TokenizationData TokenizationData
	Info             PaymentMethodInfo
}

// PaymentResponse is the client-side Google Pay API PaymentData response,
// as forwarded to the server. Order.Email and Order.BillingAddress are
// extracted from it by Normalize when not already set.
type PaymentResponse struct {
	Email             string
	PaymentMethodData PaymentMethodData
}

// Item is a single line item in an order.
type Item struct {
	Title    string
	Quantity float64
	// Price is nil when not supplied, distinguishing "unset" from 0.
	Price *float64
	// Total overrides Price*Quantity when set.
	Total *float64

	// TotalInt and TotalFixed are populated by Normalize.
	TotalInt   int64
	TotalFixed string
}

// Order describes a payment to be charged. Total, Currency, and either
// PaymentToken or PaymentResponse must be supplied by the caller; the rest
// is filled in by Normalize.
type Order struct {
	ID       string
	Currency string
	// Total is nil when not supplied, distinguishing "unset" from 0. When
	// nil, it's computed from Items.
	Total *float64
	Items []Item

	Email          string
	BillingAddress *BillingAddress
	// PaymentToken is the Google Pay payment token. Callers may supply it
	// directly (as a string or map[string]interface{}), or leave it nil
	// and supply PaymentResponse instead, from which Normalize extracts it.
	PaymentToken    interface{}
	PaymentResponse *PaymentResponse

	// Description, TotalInt, and TotalFixed are populated by Normalize.
	Description string
	TotalInt    int64
	TotalFixed  string
}

// Normalize validates order and fills in its computed fields (ID,
// Description, TotalInt, TotalFixed, and per-item totals), extracting
// PaymentToken/Email/BillingAddress from PaymentResponse when they're not
// already set. Every PSP handler calls this before doing its own
// PSP-specific work.
func Normalize(order *Order) (*Order, error) {
	if order == nil {
		return nil, errors.New("order not provided")
	}

	if order.PaymentToken == nil && order.PaymentResponse != nil {
		order.PaymentToken = order.PaymentResponse.PaymentMethodData.TokenizationData.Token
	}

	if order.Email == "" && order.PaymentResponse != nil {
		order.Email = order.PaymentResponse.Email
	}

	if order.BillingAddress == nil && order.PaymentResponse != nil {
		if ba := order.PaymentResponse.PaymentMethodData.Info.BillingAddress; ba != nil {
			parts := make([]string, 0, 3)
			for _, p := range []string{ba.Address1, ba.Address2, ba.Address3} {
				if p != "" {
					parts = append(parts, p)
				}
			}
			ba.Street = strings.Join(parts, " ")
			order.BillingAddress = ba
		}
	}

	hasNumericTotal := order.Total != nil
	hasNumericItemPrice := len(order.Items) > 0 && order.Items[0].Price != nil
	if !hasNumericTotal && !hasNumericItemPrice {
		return nil, errors.New("order contains neither numeric total, nor items with numeric price")
	}

	precision, ok := Precisions[order.Currency]
	if !ok {
		return nil, errors.New("invalid currency provided")
	}

	if isPaymentTokenEmpty(order.PaymentToken) {
		return nil, errors.New("paymentToken not provided")
	}

	if order.ID == "" {
		order.ID = uuid.New().String()
	}

	if order.Total == nil {
		sum := 0.0
		for _, item := range order.Items {
			sum += itemTotal(item)
		}
		order.Total = &sum
	}

	descParts := make([]string, 0, len(order.Items))
	for i := range order.Items {
		order.Items[i].TotalInt, order.Items[i].TotalFixed = computeTotals(itemTotal(order.Items[i]), precision)
		descParts = append(descParts, fmt.Sprintf("%v x %s", order.Items[i].Quantity, order.Items[i].Title))
	}
	order.Description = strings.Join(descParts, ", ")

	order.TotalInt, order.TotalFixed = computeTotals(*order.Total, precision)

	if raw, isString := order.PaymentToken.(string); isString {
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(raw), &parsed); err == nil {
			order.PaymentToken = parsed
		}
		// Otherwise leave PaymentToken as the raw string - not every PSP's
		// token is JSON.
	}

	return order, nil
}

func itemTotal(item Item) float64 {
	if item.Total != nil {
		return *item.Total
	}
	price := 0.0
	if item.Price != nil {
		price = *item.Price
	}
	return price * item.Quantity
}

func computeTotals(total float64, precision int) (totalInt int64, totalFixed string) {
	totalInt = int64(math.Round(total * math.Pow(10, float64(precision))))
	totalFixed = strconv.FormatFloat(total, 'f', precision, 64)
	return
}

func isPaymentTokenEmpty(token interface{}) bool {
	if token == nil {
		return true
	}
	if s, ok := token.(string); ok {
		return s == ""
	}
	return false
}
