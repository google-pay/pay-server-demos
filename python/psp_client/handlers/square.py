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

from square.client import Square
from square.environment import SquareEnvironment


def pay(config, order):
    # See PSP's docs for full API details:
    # https://developer.squareup.com/reference/square/payments-api/create-payment

    environment = SquareEnvironment.PRODUCTION if config["environment"] == "Production" else SquareEnvironment.SANDBOX
    client = Square(token=config["accessToken"], environment=environment)

    # The Google Pay token is a plain nonce string for Square (it never parses
    # as JSON), so order["paymentToken"] stays a string after normalization.
    return client.payments.create(
        source_id=order["paymentToken"],
        idempotency_key=order["id"],
        amount_money={"amount": order["totalInt"], "currency": order["currency"]},
    )
