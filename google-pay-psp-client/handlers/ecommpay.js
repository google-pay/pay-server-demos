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

const fetch = require('node-fetch');
const signer = require('ecommpay').signer;

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://developers.ecommpay.com/en/pm_googlepay.html

  let ok;

  const body = {
    general: {
      project_id: config.projectId,
      payment_id: order.id,
    },
    customer: {
      email: order.email,
      ip_address: order.ipAddress,
    },
    payment: {
      amount: order.totalInt,
      currency: order.currency,
    },
    etoken: {
      token: JSON.stringify(order.paymentToken),
    }
  };

  body.general.signature = signer(body, config.secretKey);

  return fetch(`https://api.ecommpay.com/v2/payment/googlepay/sale`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(response => {
    ok = response.ok;
    return response.json()
  }).then(response => {
    if (ok) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  });
};