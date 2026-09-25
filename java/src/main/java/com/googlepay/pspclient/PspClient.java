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

import java.util.Map;

/** Wraps a {@link PaymentHandler} with the shared config/order validation and normalization. */
public final class PspClient {

  private final PaymentHandler handler;

  PspClient(PaymentHandler handler) {
    this.handler = handler;
  }

  /**
   * Validates and normalizes {@code order}, then charges it via this PSP's handler.
   *
   * @throws PspValidationException if {@code config} or {@code order} is missing or invalid.
   * @throws Exception propagated from the PSP handler on failure.
   */
  public Object pay(Map<String, Object> config, Order order) throws Exception {
    if (config == null) {
      throw new PspValidationException("config not provided");
    }
    if (order == null) {
      throw new PspValidationException("order not provided");
    }
    OrderProcessor.process(order);
    return handler.pay(config, order);
  }
}
