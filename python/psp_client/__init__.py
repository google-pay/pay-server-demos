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

"""Google Pay PSP Client for Python.

    from psp_client import clients

    config = {
        "secretKey": "sk_test_...",
    }
    order = {
        "total": 100,
        "currency": "USD",
        "paymentResponse": payment_data,  # raw response from the Google Pay API
    }

    try:
        response = clients["stripe"].pay(config, order)
    except order_module.PaymentValidationError as err:
        print(err.error)
"""

import importlib

from . import order as order_module


class Client:
    """Wraps a raw PSP handler with shared order validation/normalization."""

    def __init__(self, handler):
        self._handler = handler

    def pay(self, config, order):
        normalized = order_module.normalize(config, order)
        if isinstance(self._handler, str):
            module = importlib.import_module(f".handlers.{self._handler}", package=__name__)
            self._handler = module.pay
        return self._handler(config, normalized)


clients = {
    name: Client(name)
    for name in ["adyen", "checkout_com", "square", "stripe"]
}

PaymentValidationError = order_module.PaymentValidationError
