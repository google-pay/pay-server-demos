# Google Pay Server Demos

This project demonstrates integrating Google Pay with various Payments Service Providers (PSPs), server-side. Each
language directory contains a self-contained client library that wraps the PSP's server-side payment API — given a
Google Pay payment token, config, and order, it charges the order and returns the PSP's response.

If you're just interested in sample code for a particular PSP and language, go straight to that language's `handlers`
directory.

## Languages

| Directory           | Language | PSPs covered                                        |
| ------------------- | -------- | --------------------------------------------------- |
| [`nodejs/`](nodejs) | Node.js  | All 19 — see [`nodejs/README.md`](nodejs/README.md) |
| [`java/`](java)     | Java     | Adyen, Checkout.com, Square, Stripe                 |
| [`python/`](python) | Python   | Adyen, Checkout.com, Square, Stripe                 |
| [`go/`](go)         | Go       | Adyen, Checkout.com, Square, Stripe                 |

## Adding a new PSP

Each language directory documents its own conventions in its own README, but the shape is the same everywhere:

- A `pay(config, order)` function per PSP (or the language's idiomatic equivalent) that charges the order and
  returns/raises on success/failure.
- A shared normalization step that computes the order total in the currency's smallest unit and its fixed-precision
  decimal string, using an ISO currency precision table.

See each language directory's README for the exact steps to add a handler.
