# Google Pay Server Demos — Go

This directory contains the Go implementation of the Google Pay PSP client library. It currently covers **Adyen,
Checkout.com, Square, and Stripe**. More PSPs will be added as official Go SDKs or REST integrations are introduced.

## Usage

Each handler in `pspclient/handlers` has the same shape: a
`func(config map[string]interface{}, order *pspclient.Order) (interface{}, error)`, matching `handlers.Handler`.
`config` holds the PSP's own field names (see the comment atop each handler file); `order` requires `Total` (or `Items`
with priced entries), `Currency`, and either `PaymentToken` or `PaymentResponse`.

```go
package main

import (
	"fmt"

	"github.com/google-pay/pay-server-demos/go/pspclient"
	"github.com/google-pay/pay-server-demos/go/pspclient/handlers"
)

func main() {
	total := 100.0
	order := &pspclient.Order{
		Total:    &total,
		Currency: "USD",
		PaymentResponse: &pspclient.PaymentResponse{
			// ... the Google Pay API's PaymentData response, as forwarded from the client.
		},
	}

	config := map[string]interface{}{
		"secretKey": "sk_test_...",
	}

	response, err := handlers.Stripe(config, order)
	if err != nil {
		fmt.Println("payment failed:", err)
		return
	}
	fmt.Println(response)
}
```

Every handler runs the order through `pspclient.Normalize` first, which:

- Extracts `PaymentToken`, `Email`, and `BillingAddress` from `PaymentResponse` when they aren't already set.
- Validates that the order has a numeric total (directly, or via priced items), a supported currency, and a payment
  token.
- Computes `TotalInt` (the amount in the currency's smallest unit, e.g. cents for USD) and `TotalFixed` (a
  fixed-precision decimal string), using the ISO currency precision table in `pspclient/precisions.go`.
- Assigns an `ID` (a generated UUID, if one isn't supplied) and a `Description` (built from `Items`).

To select a PSP by name at runtime instead of calling a handler directly, use the `handlers.All` registry (e.g.
`handlers.All["stripe"](config, order)`).

## Adding a new PSP

Add a new file to `pspclient/handlers`, exporting a function matching the `handlers.Handler` type. It should:

1. Call `requireConfig(config)` and return its error if non-nil.
2. Call `pspclient.Normalize(order)` and return its error if non-nil.
3. Build the PSP's own client from `config`'s fields (via the `str(config, "key")` helper) and call its API using
   `order`'s normalized fields (`TotalInt`, `TotalFixed`, `Currency`, `PaymentToken`, `ID`, ...).
4. Register the new function in the `All` map in `handler.go`.

## Build & test

```sh
go build ./...
go test ./...
```

Tests use only the standard `testing` package and make no live network calls: they cover `pspclient.Normalize`'s
validation and field-extraction directly, plus each handler's config/order validation (which is checked before any
SDK/network call is made).
