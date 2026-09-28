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

import com.checkout.CheckoutApi;
import com.checkout.CheckoutSdk;
import com.checkout.Environment;
import com.checkout.common.Currency;
import com.checkout.payments.request.PaymentRequest;
import com.checkout.payments.request.source.RequestTokenSource;
import com.checkout.payments.response.PaymentResponse;
import com.checkout.tokens.GooglePayTokenData;
import com.checkout.tokens.GooglePayTokenRequest;
import com.checkout.tokens.TokenResponse;
import com.googlepay.pspclient.Order;
import com.googlepay.pspclient.PaymentHandler;
import java.util.Map;

/**
 * See PSP's docs for full API details:
 * https://docs.checkout.com/payments/payment-methods/wallets/google-pay
 *
 * <p>{@code config} keys: {@code secretKey}, {@code publicKey}, {@code environment} ("SANDBOX" or
 * "PRODUCTION"). First tokenizes the raw Google Pay token data, then creates a payment from the
 * resulting token.
 */
public class CheckoutComHandler implements PaymentHandler {

  @SuppressWarnings("unchecked")
  @Override
  public Object pay(Map<String, Object> config, Order order) throws Exception {
    CheckoutApi checkoutApi =
        CheckoutSdk.builder()
            .staticKeys()
            .publicKey((String) config.get("publicKey"))
            .secretKey((String) config.get("secretKey"))
            .environment(Environment.valueOf((String) config.get("environment")))
            .build();

    Map<String, Object> tokenData = (Map<String, Object>) order.paymentToken;
    GooglePayTokenData googlePayTokenData =
        GooglePayTokenData.builder()
            .protocolVersion((String) tokenData.get("protocolVersion"))
            .signature((String) tokenData.get("signature"))
            .signedMessage((String) tokenData.get("signedMessage"))
            .build();

    TokenResponse tokenResponse =
        checkoutApi
            .tokensClient()
            .requestWalletTokenSync(GooglePayTokenRequest.builder().googlePayTokenData(googlePayTokenData).build());

    PaymentRequest paymentRequest =
        PaymentRequest.builder()
            .source(RequestTokenSource.builder().token(tokenResponse.getToken()).build())
            .currency(Currency.valueOf(order.currency))
            .amount(order.totalInt)
            .reference(order.id)
            .build();

    PaymentResponse response = checkoutApi.paymentsClient().requestPaymentSync(paymentRequest);
    return response;
  }
}
