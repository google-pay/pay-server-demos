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

const shortid = require('shortid');
const fetch = require('node-fetch');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://www.windcave.com/developer-ecommerce-google-pay

  return fetch(`https://${config.host}.windcave.com/api/v1/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(`${config.username}:${config.apiKey}`).toString('base64'),
    },
    body: JSON.stringify({
      type: 'purchase',
      amount: String(order.totalFixed),
      currency: order.currency.toUpperCase(),
      merchantReference: order.id,
      googlePay: order.paymentToken,
    }),
  }).then(response => {
    if (response.ok) {
      return Promise.resolve(response.json());
    } else {
      return Promise.reject(response.json());
    }
  });
};