/*
 * Copyright 2026 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.googlepay.pspclient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.LongConsumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Validates and normalizes an {@link Order} before it's handed to a PSP-specific {@link
 * PaymentHandler}.
 */
final class OrderProcessor {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  private OrderProcessor() {}

  static void process(Order order) {
    // Extract paymentToken / email / billingAddress from the raw Google Pay response, if needed.
    if (isEmpty(order.paymentToken) && order.paymentResponse != null) {
      if (order.paymentResponse.paymentMethodData != null
          && order.paymentResponse.paymentMethodData.tokenizationData != null) {
        order.paymentToken = order.paymentResponse.paymentMethodData.tokenizationData.token;
      }
    }

    if (order.email == null && order.paymentResponse != null) {
      order.email = order.paymentResponse.email;
    }

    if (order.billingAddress == null
        && order.paymentResponse != null
        && order.paymentResponse.paymentMethodData != null
        && order.paymentResponse.paymentMethodData.info != null
        && order.paymentResponse.paymentMethodData.info.billingAddress != null) {
      Order.BillingAddress address = order.paymentResponse.paymentMethodData.info.billingAddress;
      address.street =
          Stream.of(address.address1, address.address2, address.address3)
              .filter(s -> s != null && !s.isEmpty())
              .collect(Collectors.joining(" "));
      order.billingAddress = address;
    }

    boolean hasNumericTotal = order.total != null;
    boolean hasNumericItemPrice =
        order.items != null && !order.items.isEmpty() && order.items.get(0).price != null;
    if (!hasNumericTotal && !hasNumericItemPrice) {
      throw new PspValidationException("order contains neither numeric total, nor items with numeric price");
    }

    Integer precision = Precisions.get(order.currency);
    if (precision == null) {
      throw new PspValidationException("invalid currency provided");
    }

    if (isEmpty(order.paymentToken)) {
      throw new PspValidationException("paymentToken not provided");
    }

    if (order.id == null) {
      order.id = UUID.randomUUID().toString();
    }

    if (order.items == null) {
      order.items = new ArrayList<>();
    }

    if (order.total == null) {
      double sum = 0;
      for (Order.Item item : order.items) {
        sum += item.price * item.quantity;
      }
      order.total = sum;
    }

    for (Order.Item item : order.items) {
      applyTotals(item.price * item.quantity, precision, v -> item.totalInt = v, v -> item.totalFixed = v);
    }

    order.description =
        order.items.stream().map(item -> item.quantity + " x " + item.title).collect(Collectors.joining(", "));

    applyTotals(order.total, precision, v -> order.totalInt = v, v -> order.totalFixed = v);

    if (order.paymentToken instanceof String) {
      try {
        order.paymentToken = MAPPER.readValue((String) order.paymentToken, new TypeReference<Map<String, Object>>() {});
      } catch (JsonProcessingException e) {
        // Not JSON — leave paymentToken as the raw string (e.g. an opaque gateway nonce).
      }
    }
  }

  private static boolean isEmpty(Object token) {
    return token == null || (token instanceof String && ((String) token).isEmpty());
  }

  private static void applyTotals(double total, int precision, LongConsumer setTotalInt, Consumer<String> setTotalFixed) {
    setTotalInt.accept(Math.round(total * Math.pow(10, precision)));
    setTotalFixed.accept(String.format("%." + precision + "f", total));
  }
}
