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

import com.googlepay.pspclient.handlers.AdyenHandler;
import com.googlepay.pspclient.handlers.CheckoutComHandler;
import com.googlepay.pspclient.handlers.SquareHandler;
import com.googlepay.pspclient.handlers.StripeHandler;

/** One {@link PspClient} per supported PSP. */
public final class PspClients {

  public static final PspClient ADYEN = new PspClient(new AdyenHandler());
  public static final PspClient CHECKOUT_COM = new PspClient(new CheckoutComHandler());
  public static final PspClient SQUARE = new PspClient(new SquareHandler());
  public static final PspClient STRIPE = new PspClient(new StripeHandler());

  private PspClients() {}
}
