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
	"encoding/json"

	"github.com/adyen/adyen-go-api-library/v21/src/adyen"
	"github.com/adyen/adyen-go-api-library/v21/src/checkout"
	"github.com/adyen/adyen-go-api-library/v21/src/common"

	"github.com/google-pay/pay-server-demos/go/pspclient"
)

// Adyen config keys: apiKey, merchantAccount, environment ("TEST" or
// "LIVE").
//
// See PSP's docs for full API details:
// https://docs.adyen.com/payment-methods/google-pay/api-only
func Adyen(config map[string]interface{}, order *pspclient.Order) (interface{}, error) {
	if err := requireConfig(config); err != nil {
		return nil, err
	}
	order, err := pspclient.Normalize(order)
	if err != nil {
		return nil, err
	}

	client := adyen.NewClient(&common.Config{
		ApiKey:          str(config, "apiKey"),
		MerchantAccount: str(config, "merchantAccount"),
		Environment:     common.Environment(str(config, "environment")),
	})

	tokenJSON, err := json.Marshal(order.PaymentToken)
	if err != nil {
		return nil, err
	}
	paymentMethod := checkout.GooglePayDetailsAsCheckoutPaymentMethod(checkout.NewGooglePayDetails(string(tokenJSON)))

	service := client.Checkout()
	input := service.PaymentsApi.PaymentsInput().PaymentRequest(checkout.PaymentRequest{
		Amount: checkout.Amount{
			Currency: order.Currency,
			Value:    order.TotalInt,
		},
		PaymentMethod:   paymentMethod,
		Reference:       order.ID,
		MerchantAccount: str(config, "merchantAccount"),
	})

	resp, _, err := service.PaymentsApi.Payments(context.Background(), input)
	if err != nil {
		return nil, err
	}
	return &resp, nil
}
