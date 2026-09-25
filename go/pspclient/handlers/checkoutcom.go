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
	"github.com/checkout/checkout-sdk-go/common"
	"github.com/checkout/checkout-sdk-go/configuration"
	"github.com/checkout/checkout-sdk-go/nas"
	checkoutpayments "github.com/checkout/checkout-sdk-go/payments/nas"
	"github.com/checkout/checkout-sdk-go/payments/nas/sources"
	"github.com/checkout/checkout-sdk-go/tokens"

	"github.com/google-pay/pay-server-demos/go/pspclient"
)

// CheckoutCom config keys: secretKey, publicKey, environment ("sandbox" or
// "production", defaults to sandbox).
//
// See PSP's docs for full API details:
// https://docs.checkout.com/payments/payment-methods/wallets/google-pay
func CheckoutCom(config map[string]interface{}, order *pspclient.Order) (interface{}, error) {
	if err := requireConfig(config); err != nil {
		return nil, err
	}
	order, err := pspclient.Normalize(order)
	if err != nil {
		return nil, err
	}

	env := configuration.Sandbox()
	if str(config, "environment") == "production" {
		env = configuration.Production()
	}
	creds := configuration.NewDefaultKeysSdkCredentials(str(config, "secretKey"), str(config, "publicKey"))
	api := nas.CheckoutApi(configuration.NewConfiguration(creds, nil, env, nil, nil))

	// order.PaymentToken is the parsed Google Pay PaymentData token, with
	// signature/protocolVersion/signedMessage fields.
	tokenData, _ := order.PaymentToken.(map[string]interface{})
	tokenResp, err := api.Tokens.RequestWalletToken(tokens.WalletTokenRequest{
		Type: tokens.GooglePay,
		TokenData: &tokens.GooglePayTokenData{
			Signature:       tokenField(tokenData, "signature"),
			ProtocolVersion: tokenField(tokenData, "protocolVersion"),
			SignedMessage:   tokenField(tokenData, "signedMessage"),
		},
	})
	if err != nil {
		return nil, err
	}

	source := sources.NewRequestTokenSource()
	source.Token = tokenResp.Token

	return api.Payments.RequestPayment(checkoutpayments.PaymentRequest{
		Source:    source,
		Currency:  common.Currency(order.Currency),
		Amount:    order.TotalInt,
		Reference: order.ID,
	}, nil)
}

func tokenField(token map[string]interface{}, key string) string {
	if v, ok := token[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}
