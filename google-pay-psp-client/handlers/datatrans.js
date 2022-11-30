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

const shortid = require('shortid');
const fetch = require('node-fetch');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://docs.datatrans.ch/docs/payment-methods#section-google-pay

  const host = config.environment === 'sandbox' ? 'api.sandbox' : 'api';
  const auth = Buffer.from(`${config.clientConfig.gatewayMerchantId}:${config.password}`).toString('base64');

  return fetch(`https://${host}.datatrans.com/v1/transactions/authorize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({
      currency: order.currency,
      amount: order.totalInt,
      PAY: order.paymentToken,
      refno: shortid.generate(),
    }),
  }).then(response => {
    if (response.ok) {
      return Promise.resolve(response.json());
    } else {
      return Promise.reject(response.json());
    }
  });
};
