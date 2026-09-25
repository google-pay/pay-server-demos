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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Validation and normalization tests for {@link PspClient}.
 */
class OrderProcessingTest {

  private static final PaymentHandler FAIL_IF_CALLED =
      (config, order) -> fail("handler should not have been invoked");

  private static Map<String, Object> config() {
    return new HashMap<>();
  }

  @Test
  void requiresConfig() {
    PspClient client = new PspClient(FAIL_IF_CALLED);
    Exception e = assertThrows(PspValidationException.class, () -> client.pay(null, new Order()));
    assertEquals("config not provided", e.getMessage());
  }

  @Test
  void requiresOrder() {
    PspClient client = new PspClient(FAIL_IF_CALLED);
    Exception e = assertThrows(PspValidationException.class, () -> client.pay(config(), null));
    assertEquals("order not provided", e.getMessage());
  }

  @Test
  void requiresNumericTotalOrItemPrice() {
    PspClient client = new PspClient(FAIL_IF_CALLED);
    Order order = new Order();
    Exception e = assertThrows(PspValidationException.class, () -> client.pay(config(), order));
    assertEquals("order contains neither numeric total, nor items with numeric price", e.getMessage());
  }

  @Test
  void requiresValidCurrency() {
    PspClient client = new PspClient(FAIL_IF_CALLED);
    Order order = new Order();
    order.total = 1.0;
    order.currency = "NOT_A_CURRENCY";
    Exception e = assertThrows(PspValidationException.class, () -> client.pay(config(), order));
    assertEquals("invalid currency provided", e.getMessage());
  }

  @Test
  void requiresPaymentToken() {
    PspClient client = new PspClient(FAIL_IF_CALLED);
    Order order = new Order();
    order.total = 1.0;
    order.currency = "USD";
    Exception e = assertThrows(PspValidationException.class, () -> client.pay(config(), order));
    assertEquals("paymentToken not provided", e.getMessage());
  }

  @Test
  @SuppressWarnings("unchecked")
  void extractsPaymentTokenEmailAndBillingAddressFromPaymentResponse() throws Exception {
    Order.PaymentResponse paymentResponse = new Order.PaymentResponse();
    paymentResponse.email = "customer@example.com";
    paymentResponse.paymentMethodData = new Order.PaymentMethodData();
    paymentResponse.paymentMethodData.tokenizationData = new Order.TokenizationData();
    paymentResponse.paymentMethodData.tokenizationData.token = "{\"id\": \"tok_123\"}";
    paymentResponse.paymentMethodData.info = new Order.Info();
    paymentResponse.paymentMethodData.info.billingAddress = new Order.BillingAddress();
    paymentResponse.paymentMethodData.info.billingAddress.address1 = "123 Main St";
    paymentResponse.paymentMethodData.info.billingAddress.address2 = "Suite 100";
    paymentResponse.paymentMethodData.info.billingAddress.address3 = "";

    Order order = new Order();
    order.total = 10.0;
    order.currency = "USD";
    order.paymentResponse = paymentResponse;

    Order[] captured = new Order[1];
    PaymentHandler capturing =
        (config, o) -> {
          captured[0] = o;
          return "ok";
        };

    Object result = new PspClient(capturing).pay(config(), order);

    assertEquals("ok", result);
    assertTrue(captured[0].paymentToken instanceof Map);
    assertEquals("tok_123", ((Map<String, Object>) captured[0].paymentToken).get("id"));
    assertEquals("customer@example.com", captured[0].email);
    assertEquals("123 Main St Suite 100", captured[0].billingAddress.street);
  }
}
