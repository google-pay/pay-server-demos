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

import com.adyen.Client;
import com.adyen.Config;
import com.adyen.enums.Environment;
import com.adyen.model.checkout.Amount;
import com.adyen.model.checkout.CheckoutPaymentMethod;
import com.adyen.model.checkout.GooglePayDetails;
import com.adyen.model.checkout.PaymentRequest;
import com.adyen.model.checkout.PaymentResponse;
import com.adyen.service.checkout.PaymentsApi;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlepay.pspclient.Order;
import com.googlepay.pspclient.PaymentHandler;
import java.util.Map;

/**
 * See PSP's docs for full API details:
 * https://docs.adyen.com/payment-methods/google-pay/api-only
 *
 * <p>{@code config} keys: {@code apiKey}, {@code merchantAccount}, {@code environment} ("TEST" or
 * "LIVE").
 */
public class AdyenHandler implements PaymentHandler {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  @Override
  public Object pay(Map<String, Object> config, Order order) throws Exception {
    Config adyenConfig =
        new Config().apiKey((String) config.get("apiKey")).environment(Environment.valueOf((String) config.get("environment")));

    Client client = new Client(adyenConfig);
    PaymentsApi paymentsApi = new PaymentsApi(client);

    GooglePayDetails paymentMethod =
        new GooglePayDetails().type(GooglePayDetails.TypeEnum.GOOGLEPAY).googlePayToken(MAPPER.writeValueAsString(order.paymentToken));

    PaymentRequest paymentRequest =
        new PaymentRequest()
            .merchantAccount((String) config.get("merchantAccount"))
            .reference(order.id)
            .amount(new Amount().currency(order.currency).value(order.totalInt))
            .paymentMethod(new CheckoutPaymentMethod(paymentMethod));

    PaymentResponse response = paymentsApi.payments(paymentRequest);
    return response;
  }
}
