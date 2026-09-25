# Copyright 2026 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from checkout_sdk.checkout_sdk import CheckoutSdk
from checkout_sdk.environment import Environment
from checkout_sdk.payments.payments import PaymentRequest, PaymentRequestTokenSource
from checkout_sdk.tokens.tokens import GooglePayTokenRequest


def pay(config, order):
    # See PSP's docs for full API details:
    # https://docs.checkout.com/payments/payment-methods/wallets/google-pay

    environment = Environment.production() if config.get("environment") == "production" else Environment.sandbox()

    checkout = (
        CheckoutSdk.builder()
        .public_key(config["publicKey"])
        .secret_key(config["secretKey"])
        .environment(environment)
        .build()
    )

    token_request = GooglePayTokenRequest()
    token_request.token_data = order["paymentToken"]
    token_response = checkout.tokens.request_wallet_token(token_request)

    payment_source = PaymentRequestTokenSource()
    payment_source.token = token_response.token

    payment_request = PaymentRequest()
    payment_request.source = payment_source
    payment_request.currency = order["currency"]
    payment_request.amount = order["totalInt"]
    payment_request.reference = order["id"]

    return checkout.payments.request_payment(payment_request)
