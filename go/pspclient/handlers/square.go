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

package handlers

import (
	"context"
	"errors"
	"fmt"

	square "github.com/square/square-go-sdk/v2"
	squareclient "github.com/square/square-go-sdk/v2/client"
	"github.com/square/square-go-sdk/v2/option"

	"github.com/google-pay/pay-server-demos/go/pspclient"
)

const squareSandboxBaseURL = "https://connect.squareupsandbox.com"

// Square config keys: environment ("sandbox" or "production"), accessToken.
//
// See PSP's docs for full API details:
// https://developer.squareup.com/reference/square/payments-api/create-payment
func Square(config map[string]interface{}, order *pspclient.Order) (interface{}, error) {
	if err := requireConfig(config); err != nil {
		return nil, err
	}
	order, err := pspclient.Normalize(order)
	if err != nil {
		return nil, err
	}

	// order.PaymentToken is the raw Google Pay token string: Square's
	// sourceId is that token verbatim, not a parsed object.
	sourceID, _ := order.PaymentToken.(string)
	if sourceID == "" {
		return nil, errors.New("paymentToken not provided")
	}

	opts := []option.RequestOption{option.WithToken(str(config, "accessToken"))}
	if str(config, "environment") == "sandbox" {
		opts = append(opts, option.WithBaseURL(squareSandboxBaseURL))
	}
	client := squareclient.NewClient(opts...)

	currency, err := square.NewCurrencyFromString(order.Currency)
	if err != nil {
		return nil, err
	}

	resp, err := client.Payments.Create(context.Background(), &square.CreatePaymentRequest{
		SourceID:       sourceID,
		IdempotencyKey: order.ID,
		AmountMoney: &square.Money{
			Amount:   square.Int64(order.TotalInt),
			Currency: currency.Ptr(),
		},
	})
	if err != nil {
		return nil, err
	}
	if len(resp.Errors) > 0 {
		return nil, fmt.Errorf("square: %v", resp.Errors)
	}
	return resp, nil
}
