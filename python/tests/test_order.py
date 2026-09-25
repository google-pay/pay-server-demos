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

from psp_client.order import PaymentValidationError, normalize


class ValidationTests(unittest.TestCase):
    # Each case: description, config, order, expected error message.
    cases = [
        ("client requires config", None, None, "config not provided"),
        ("client requires order", {}, None, "order not provided"),
        (
            "client requires numeric order total",
            {},
            {"total": "x"},
            "order contains neither numeric total, nor items with numeric price",
        ),
        (
            "client requires valid currency",
            {},
            {"total": 1, "currency": "foo"},
            "invalid currency provided",
        ),
        (
            "client requires paymentToken",
            {},
            {"total": 1, "currency": "USD"},
            "paymentToken not provided",
        ),
    ]

    def test_validation_errors(self):
        for description, config, order, expected_message in self.cases:
            with self.subTest(description):
                with self.assertRaises(PaymentValidationError) as ctx:
                    normalize(config, order)
                self.assertEqual(ctx.exception.error, expected_message)


class NormalizationTests(unittest.TestCase):
    def test_extracts_payment_token_email_and_billing_address(self):
        order = {
            "total": 10,
            "currency": "USD",
            "paymentResponse": {
                "paymentMethodData": {
                    "tokenizationData": {"token": '{"id": "tok_123"}'},
                    "info": {
                        "billingAddress": {
                            "address1": "123 Main St",
                            "address2": "Suite 100",
                            "address3": "",
                        }
                    },
                },
                "email": "customer@example.com",
            },
        }

        normalized = normalize({}, order)

        self.assertEqual(normalized["paymentToken"], {"id": "tok_123"})
        self.assertEqual(normalized["email"], "customer@example.com")
        self.assertEqual(normalized["billingAddress"]["street"], "123 Main St Suite 100")
        self.assertEqual(normalized["totalInt"], 1000)
        self.assertEqual(normalized["totalFixed"], "10.00")
        self.assertTrue(normalized["id"])

    def test_computes_totals_from_items_when_total_missing(self):
        order = {
            "currency": "JPY",  # 0 decimal places
            "items": [{"title": "Widget", "quantity": 3, "price": 500}],
            "paymentToken": "not-json",
        }

        normalized = normalize({}, order)

        self.assertEqual(normalized["total"], 1500)
        self.assertEqual(normalized["totalInt"], 1500)
        self.assertEqual(normalized["totalFixed"], "1500")
        self.assertEqual(normalized["description"], "3 x Widget")
        # "not-json" doesn't parse as JSON, so it's left as a raw string.
        self.assertEqual(normalized["paymentToken"], "not-json")


if __name__ == "__main__":
    unittest.main()
