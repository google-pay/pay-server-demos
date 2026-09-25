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
	"testing"

	"github.com/google-pay/pay-server-demos/go/pspclient"
)

func float64Ptr(v float64) *float64 { return &v }

// Every handler must reject a missing config before it ever reaches its
// PSP's SDK/network call.
func TestHandlersRequireConfig(t *testing.T) {
	for name, handler := range All {
		t.Run(name, func(t *testing.T) {
			_, err := handler(nil, &pspclient.Order{Total: float64Ptr(1), Currency: "USD", PaymentToken: "tok"})
			if err == nil || err.Error() != "config not provided" {
				t.Fatalf("%s error = %v, want %q", name, err, "config not provided")
			}
		})
	}
}

// Every handler must propagate Normalize's validation errors before it
// ever reaches its PSP's SDK/network call.
func TestHandlersPropagateValidationErrors(t *testing.T) {
	dummyConfig := map[string]interface{}{
		"secretKey":       "x",
		"publicKey":       "x",
		"apiKey":          "x",
		"merchantAccount": "x",
		"accessToken":     "x",
		"environment":     "sandbox",
	}
	for name, handler := range All {
		t.Run(name, func(t *testing.T) {
			_, err := handler(dummyConfig, nil)
			if err == nil || err.Error() != "order not provided" {
				t.Fatalf("%s error = %v, want %q", name, err, "order not provided")
			}
		})
	}
}

// fakeHandler exercises the same Normalize step every real handler goes
// through, standing in for a PSP SDK call so this test needs no network
// access.
func fakeHandler(config map[string]interface{}, order *pspclient.Order) (interface{}, error) {
	if err := requireConfig(config); err != nil {
		return nil, err
	}
	return pspclient.Normalize(order)
}

func TestFakeHandlerNormalizesOrderFromPaymentResponse(t *testing.T) {
	order := &pspclient.Order{
		Total:    float64Ptr(10),
		Currency: "USD",
		PaymentResponse: &pspclient.PaymentResponse{
			Email: "customer@example.com",
			PaymentMethodData: pspclient.PaymentMethodData{
				TokenizationData: pspclient.TokenizationData{Token: `{"id": "tok_123"}`},
				Info: pspclient.PaymentMethodInfo{
					BillingAddress: &pspclient.BillingAddress{
						Address1: "123 Main St",
						Address2: "Suite 100",
					},
				},
			},
		},
	}

	result, err := fakeHandler(map[string]interface{}{"secretKey": "sk_test_123"}, order)
	if err != nil {
		t.Fatalf("fakeHandler() error = %v, want nil", err)
	}
	normalized := result.(*pspclient.Order)

	token, ok := normalized.PaymentToken.(map[string]interface{})
	if !ok || token["id"] != "tok_123" {
		t.Errorf("PaymentToken = %#v, want {id: tok_123}", normalized.PaymentToken)
	}
	if normalized.Email != "customer@example.com" {
		t.Errorf("Email = %q, want customer@example.com", normalized.Email)
	}
	if normalized.BillingAddress == nil || normalized.BillingAddress.Street != "123 Main St Suite 100" {
		t.Errorf("BillingAddress.Street = %v, want %q", normalized.BillingAddress, "123 Main St Suite 100")
	}
}
