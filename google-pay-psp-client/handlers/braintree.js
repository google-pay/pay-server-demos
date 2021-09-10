/*
 * Copyright 2021 Google Inc.
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

const braintree = require('braintree');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://developer.paypal.com/braintree/docs/guides/google-pay/overview

  const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment[config.environment],
    merchantId: config.merchantId,
    publicKey: config.publicKey,
    privateKey: config.privateKey,
  });

  return gateway.transaction.sale({
    amount: String(order.totalFixed),
    paymentMethodNonce: order.paymentToken.androidPayCards[0].nonce,
  }).then(response => {
    return new Promise((resolve, reject) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};
