# Google Pay Server Demos — Python

This directory contains the Python implementation of the Google Pay PSP client library. It currently covers 4 PSPs —
**Adyen, Checkout.com, Square, and Stripe**. More PSPs will be added as official Python libraries or REST integrations
are introduced.

## Setup

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Test

```sh
python -m unittest discover -s tests
```

## Client Library

Every PSP module exposes a `pay(config, order)` method. `order` requires a `total`, `currency`, and either a raw Google
Pay `paymentResponse` or an already-extracted `paymentToken`.

```python
from psp_client import clients, PaymentValidationError

# PSP-specific configuration, in this case Stripe.
config = {
    "secretKey": "sk_test_...",
}

# An order requires a total, currency, and client-side response from the Google Pay API.
order = {
    "total": 100,
    "currency": "USD",
    "paymentResponse": payment_response,  # raw response from the Google Pay API
}

try:
    response = clients["stripe"].pay(config, order)
    print(response)  # PSP-specific response
except PaymentValidationError as err:
    print(err.error)  # validation message
except Exception as err:
    print(err)  # PSP-specific error
```

## Current PSPs

- [Adyen](https://docs.adyen.com/payment-methods/google-pay/api-only)
- [Checkout.com](https://docs.checkout.com/payments/payment-methods/wallets/google-pay)
- [Square](https://developer.squareup.com/docs/payment-form/add-digital-wallets/google-pay)
- [Stripe](https://stripe.com/docs/google-pay)

## Adding a new PSP

1. Add a new module to `psp_client/handlers/`. It should export a single `pay(config, order)` function that performs the
   charge and returns the PSP's response, raising on failure.
2. Register it in the `clients` dict in `psp_client/__init__.py`.
3. The `order` passed to your handler has already been validated and normalized by `psp_client/order.py` — you can rely
   on:
   - `order["totalInt"]` — the total amount in the smallest possible unit (e.g. cents for USD)
   - `order["totalFixed"]` — the rounded total amount as a fixed-precision decimal string
   - `order["paymentToken"]` — the Google Pay token, JSON-decoded into a `dict` when possible (left as a raw string
     otherwise, e.g. for PSPs like Square whose token is a plain nonce)
