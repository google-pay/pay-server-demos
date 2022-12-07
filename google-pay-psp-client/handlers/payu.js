/*
 * Copyright 2022 Google Inc.
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

const payU = require('nodejs-payu-sdk');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://developers.payu.com/en/google_pay.html

  const client = new payU(config.clientId, config.clientSecret, config.merchantPosId, config.secondKey, config.environment);

  return client.createOrder({
    payMethods: {
      payMethod: {
        // signifies Google Pay being used
        value: 'ap',
        type: 'PBL',
        authorizationCode: Buffer.from(JSON.stringify(order.paymentToken)).toString('base64'),
      }
    },
    merchantPosId: config.merchantPosId,
    currencyCode: order.currency,
    totalAmount: order.totalInt,
    customerIp: order.ipAddress,
    description: order.description,
  });
};


