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

package pspclient

import "testing"

func float64Ptr(v float64) *float64 { return &v }

func TestNormalizeValidationErrors(t *testing.T) {
	cases := []struct {
		name    string
		order   *Order
		wantErr string
	}{
		{
			name:    "order not provided",
			order:   nil,
			wantErr: "order not provided",
		},
		{
			name:    "requires numeric order total",
			order:   &Order{},
			wantErr: "order contains neither numeric total, nor items with numeric price",
		},
		{
			name:    "requires valid currency",
			order:   &Order{Total: float64Ptr(1), Currency: "foo"},
			wantErr: "invalid currency provided",
		},
		{
			name:    "requires paymentToken",
			order:   &Order{Total: float64Ptr(1), Currency: "USD"},
			wantErr: "paymentToken not provided",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := Normalize(tc.order)
			if err == nil || err.Error() != tc.wantErr {
				t.Fatalf("Normalize() error = %v, want %q", err, tc.wantErr)
			}
		})
	}
}

func TestNormalizeExtractsFromPaymentResponse(t *testing.T) {
	order := &Order{
		Total:    float64Ptr(10),
		Currency: "USD",
		PaymentResponse: &PaymentResponse{
			Email: "customer@example.com",
			PaymentMethodData: PaymentMethodData{
				TokenizationData: TokenizationData{Token: `{"id": "tok_123"}`},
				Info: PaymentMethodInfo{
					BillingAddress: &BillingAddress{
						Address1: "123 Main St",
						Address2: "Suite 100",
						Address3: "",
					},
				},
			},
		},
	}

	normalized, err := Normalize(order)
	if err != nil {
		t.Fatalf("Normalize() error = %v, want nil", err)
	}

	token, ok := normalized.PaymentToken.(map[string]interface{})
	if !ok {
		t.Fatalf("PaymentToken = %#v, want parsed map", normalized.PaymentToken)
	}
	if token["id"] != "tok_123" {
		t.Errorf("PaymentToken[id] = %v, want tok_123", token["id"])
	}
	if normalized.Email != "customer@example.com" {
		t.Errorf("Email = %q, want customer@example.com", normalized.Email)
	}
	if normalized.BillingAddress == nil || normalized.BillingAddress.Street != "123 Main St Suite 100" {
		t.Errorf("BillingAddress.Street = %v, want %q", normalized.BillingAddress, "123 Main St Suite 100")
	}
	if normalized.ID == "" {
		t.Error("ID = \"\", want a generated uuid")
	}
	if normalized.TotalInt != 1000 {
		t.Errorf("TotalInt = %d, want 1000", normalized.TotalInt)
	}
	if normalized.TotalFixed != "10.00" {
		t.Errorf("TotalFixed = %q, want 10.00", normalized.TotalFixed)
	}
}

func TestNormalizeComputesTotalsFromItems(t *testing.T) {
	order := &Order{
		Currency:     "JPY",
		PaymentToken: "raw-token",
		Items: []Item{
			{Title: "Widget", Quantity: 2, Price: float64Ptr(150)},
			{Title: "Gadget", Quantity: 1, Price: float64Ptr(200)},
		},
	}

	normalized, err := Normalize(order)
	if err != nil {
		t.Fatalf("Normalize() error = %v, want nil", err)
	}

	if normalized.TotalInt != 500 {
		t.Errorf("TotalInt = %d, want 500", normalized.TotalInt)
	}
	if normalized.TotalFixed != "500" {
		t.Errorf("TotalFixed = %q, want 500", normalized.TotalFixed)
	}
	if normalized.Description != "2 x Widget, 1 x Gadget" {
		t.Errorf("Description = %q, want %q", normalized.Description, "2 x Widget, 1 x Gadget")
	}
	if normalized.Items[0].TotalInt != 300 || normalized.Items[1].TotalInt != 200 {
		t.Errorf("item totals = %d, %d, want 300, 200", normalized.Items[0].TotalInt, normalized.Items[1].TotalInt)
	}
	// PaymentToken isn't valid JSON, so it should be left as the raw string.
	if normalized.PaymentToken != "raw-token" {
		t.Errorf("PaymentToken = %v, want raw-token", normalized.PaymentToken)
	}
}
