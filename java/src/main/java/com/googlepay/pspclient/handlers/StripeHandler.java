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
import com.stripe.StripeClient;
import com.stripe.model.Charge;
import com.stripe.param.ChargeCreateParams;
import java.util.Locale;
import java.util.Map;

/**
 * See PSP's docs for full API details: https://stripe.com/docs/payments/charges-api/connect
 *
 * <p>{@code config} keys: {@code secretKey}.
 */
public class StripeHandler implements PaymentHandler {

  @SuppressWarnings("unchecked")
  @Override
  public Object pay(Map<String, Object> config, Order order) throws Exception {
    StripeClient client = new StripeClient((String) config.get("secretKey"));

    Map<String, Object> paymentToken = (Map<String, Object>) order.paymentToken;
    ChargeCreateParams params =
        ChargeCreateParams.builder()
            .setAmount(order.totalInt)
            .setCurrency(order.currency.toLowerCase(Locale.ROOT))
            .setSource((String) paymentToken.get("id"))
            .build();

    Charge charge = client.v1().charges().create(params);
    return charge;
  }
}
