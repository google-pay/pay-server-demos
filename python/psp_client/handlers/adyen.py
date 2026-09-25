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

import json

import Adyen


def pay(config, order):
    # See PSP's docs for full API details:
    # https://docs.adyen.com/payment-methods/google-pay/api-only

    client = Adyen.Adyen(
        xapikey=config["apiKey"],
        merchant_account=config["merchantAccount"],
        platform=config["environment"],
    )

    return client.checkout.payments_api.payments(
        {
            "amount": {"currency": order["currency"], "value": order["totalInt"]},
            "paymentMethod": {
                "type": "paywithgoogle",
                "googlePayToken": json.dumps(order["paymentToken"]),
            },
            "reference": order["id"],
            "merchantAccount": config["merchantAccount"],
        }
    )
