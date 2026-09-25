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

import unittest
from unittest.mock import MagicMock

from psp_client import Client


class ClientDispatchTests(unittest.TestCase):
    """Verifies Client normalizes before dispatch, and never calls the
    handler at all when validation fails."""

    def test_does_not_invoke_handler_when_config_missing(self):
        handler = MagicMock()
        with self.assertRaises(Exception) as ctx:
            Client(handler).pay(None, {})
        self.assertEqual(ctx.exception.error, "config not provided")
        handler.assert_not_called()

    def test_invokes_handler_with_normalized_order(self):
        handler = MagicMock(return_value={"success": True})
        config = {"secretKey": "sk_test_123"}
        order = {
            "total": 10,
            "currency": "USD",
            "paymentResponse": {
                "paymentMethodData": {
                    "tokenizationData": {"token": '{"id": "tok_123"}'},
                    "info": {"billingAddress": {"address1": "123 Main St", "address2": "Suite 100", "address3": ""}},
                },
                "email": "customer@example.com",
            },
        }

        result = Client(handler).pay(config, order)

        self.assertEqual(result, {"success": True})
        handler.assert_called_once()
        passed_config, passed_order = handler.call_args[0]
        self.assertEqual(passed_config, config)
        self.assertEqual(passed_order["paymentToken"], {"id": "tok_123"})
        self.assertEqual(passed_order["email"], "customer@example.com")
        self.assertEqual(passed_order["billingAddress"]["street"], "123 Main St Suite 100")


if __name__ == "__main__":
    unittest.main()
