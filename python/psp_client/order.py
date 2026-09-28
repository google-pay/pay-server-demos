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

"""Shared order validation/normalization, applied before every PSP handler runs.

Every PSP's `pay(config, order)` is wrapped by `normalize()` below, which
validates the incoming config/order and fills in derived fields (total in
minor units, fixed-precision decimal total, order id, description, and the
payment token/email/billing address extracted from a raw Google Pay
`paymentResponse`), so individual handlers can assume a consistent shape.
"""

import json
import numbers
import uuid

from .precisions import PRECISIONS


class PaymentValidationError(Exception):
    """Raised when config or order fails validation."""

    def __init__(self, message):
        super().__init__(message)
        self.error = message


def _is_number(value):
    return type(value) in (int, float)


def _with_totals(obj, precision):
    total = obj["total"] if obj.get("total") is not None else obj["price"] * obj["quantity"]
    obj["totalInt"] = round(total * (10**precision))
    obj["totalFixed"] = f"{total:.{precision}f}"
    return obj


def normalize(config, order):
    """Validates and normalizes `order` in place, returning it.

    Raises PaymentValidationError on invalid input, before any PSP is ever
    contacted.
    """
    if not isinstance(config, dict):
        raise PaymentValidationError("config not provided")
    if not isinstance(order, dict):
        raise PaymentValidationError("order not provided")

    payment_response = order.get("paymentResponse")

    if not order.get("paymentToken") and payment_response:
        order["paymentToken"] = payment_response["paymentMethodData"]["tokenizationData"]["token"]

    if not order.get("email") and payment_response:
        order["email"] = payment_response.get("email")

    if not order.get("billingAddress") and payment_response:
        billing_address = payment_response["paymentMethodData"]["info"].get("billingAddress")
        order["billingAddress"] = billing_address
        if billing_address:
            billing_address["street"] = " ".join(
                s
                for s in (
                    billing_address.get("address1", ""),
                    billing_address.get("address2", ""),
                    billing_address.get("address3", ""),
                )
                if s
            )

    items = order.get("items")
    has_numeric_total = _is_number(order.get("total"))
    has_numeric_item_price = bool(items) and _is_number(items[0].get("price"))
    if not has_numeric_total and not has_numeric_item_price:
        raise PaymentValidationError("order contains neither numeric total, nor items with numeric price")

    precision = PRECISIONS.get(order.get("currency"))
    if precision is None:
        raise PaymentValidationError("invalid currency provided")

    if not order.get("paymentToken"):
        raise PaymentValidationError("paymentToken not provided")

    order["id"] = order.get("id") or str(uuid.uuid4())
    order["total"] = order.get("total") or sum(i["price"] * i["quantity"] for i in items)
    order["items"] = [_with_totals(i, precision) for i in items] if items else []
    order["description"] = ", ".join(f'{i["quantity"]} x {i["title"]}' for i in order["items"])
    order = _with_totals(order, precision)

    if isinstance(order["paymentToken"], str):
        try:
            order["paymentToken"] = json.loads(order["paymentToken"])
        except json.JSONDecodeError:
            pass

    return order
