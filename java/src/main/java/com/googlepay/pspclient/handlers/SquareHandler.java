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

package com.googlepay.pspclient.handlers;

import com.googlepay.pspclient.Order;
import com.googlepay.pspclient.PaymentHandler;
import com.squareup.square.SquareClient;
import com.squareup.square.core.Environment;
import com.squareup.square.types.CreatePaymentRequest;
import com.squareup.square.types.CreatePaymentResponse;
import com.squareup.square.types.Currency;
import com.squareup.square.types.Money;
import java.util.Map;

/**
 * See PSP's docs for full API details:
 * https://developer.squareup.com/reference/square/payments-api/create-payment
 *
 * <p>{@code config} keys: {@code environment} ("SANDBOX" or "PRODUCTION"), {@code accessToken}.
 *
 * <p>Unlike the other three PSPs here, Square's Google Pay token is an opaque nonce rather than
 * JSON, so it's used as-is as the payment source id (the normalization step leaves it as a
 * {@code String} since it doesn't parse as JSON).
 */
public class SquareHandler implements PaymentHandler {

  @Override
  public Object pay(Map<String, Object> config, Order order) throws Exception {
    SquareClient client =
        SquareClient.builder()
            .token((String) config.get("accessToken"))
            .environment(environmentFor((String) config.get("environment")))
            .build();

    CreatePaymentRequest request =
        CreatePaymentRequest.builder()
            .sourceId((String) order.paymentToken)
            .idempotencyKey(order.id)
            .amountMoney(Money.builder().amount(order.totalInt).currency(Currency.valueOf(order.currency)).build())
            .build();

    CreatePaymentResponse response = client.payments().create(request);
    return response;
  }

  private static Environment environmentFor(String name) {
    return "PRODUCTION".equalsIgnoreCase(name) ? Environment.PRODUCTION : Environment.SANDBOX;
  }
}
