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

import java.util.List;

/**
 * An order to charge. Callers populate {@code total} (or {@code items}), {@code currency}, and
 * either {@code paymentToken} directly or {@code paymentResponse} (the raw Google Pay API
 * response, from which {@code paymentToken}, {@code email}, and {@code billingAddress} are
 * extracted). {@link PspClient#pay} fills in the remaining fields ({@code id}, {@code totalInt},
 * {@code totalFixed}, {@code description}) before invoking the PSP handler.
 */
public class Order {

  public String id;
  public Double total;
  public long totalInt;
  public String totalFixed;
  public String currency;
  public List<Item> items;
  public String description;

  /**
   * A JSON string (as received from Google Pay) before normalization; a parsed {@code
   * Map<String, Object>} after {@link PspClient#pay} runs, unless parsing fails, in which case it
   * is left as the original string.
   */
  public Object paymentToken;

  public String email;
  public BillingAddress billingAddress;
  public PaymentResponse paymentResponse;

  public static class Item {
    public String title;
    public Double price;
    public Integer quantity;
    public long totalInt;
    public String totalFixed;
  }

  public static class BillingAddress {
    public String address1;
    public String address2;
    public String address3;
    public String street;
  }

  /** The raw Google Pay client-side payment response, as sent to the server. */
  public static class PaymentResponse {
    public String email;
    public PaymentMethodData paymentMethodData;
  }

  public static class PaymentMethodData {
    public TokenizationData tokenizationData;
    public Info info;
  }

  public static class TokenizationData {
    public String token;
  }

  public static class Info {
    public BillingAddress billingAddress;
  }
}
