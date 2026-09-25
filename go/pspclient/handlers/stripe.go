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
	"strings"

	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/charge"

	"github.com/google-pay/pay-server-demos/go/pspclient"
)

// Stripe config keys: secretKey.
//
// See PSP's docs for full API details:
// https://stripe.com/docs/payments/charges-api/connect
func Stripe(config map[string]interface{}, order *pspclient.Order) (interface{}, error) {
	if err := requireConfig(config); err != nil {
		return nil, err
	}
	order, err := pspclient.Normalize(order)
	if err != nil {
		return nil, err
	}

	// order.PaymentToken is the parsed Stripe token object; charges.create
	// uses its "id" field as the charge source.
	token, _ := order.PaymentToken.(map[string]interface{})
	source, _ := token["id"].(string)

	client := charge.Client{
		B:   stripe.GetBackend(stripe.APIBackend),
		Key: str(config, "secretKey"),
	}

	params := &stripe.ChargeParams{
		Amount:   stripe.Int64(order.TotalInt),
		Currency: stripe.String(strings.ToLower(order.Currency)),
	}
	if err := params.SetSource(source); err != nil {
		return nil, err
	}

	return client.New(params)
}
