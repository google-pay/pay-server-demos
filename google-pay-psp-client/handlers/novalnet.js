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

const fetch = require('node-fetch');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://developer.novalnet.de/onlinepayments/aboutgooglepay

  let ok;

  // Splitting the full name once makes invalid assumptions about
  // the format of a name, so we only do this as a fallback here,
  // allowing the developer to specify them directly on the object.
  order.firstName ||= order.billingAddress.name.split(' ')[0];
  order.lastName ||= order.billingAddress.name.split(' ')[1];

  return fetch('https://payport.novalnet.de/v2/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-NN-Access-Key': Buffer.from(config.paymentAccessKey).toString('base64'),
    },
    body: JSON.stringify({
      merchant: {
        signature: config.apiSignature,
        tariff: config.tariffId,
      },
      customer: {
        first_name: order.firstName,
        last_name: order.lastName,
        email: order.email,
        billing: {
          street: order.billingAddress.street,
          city: order.billingAddress.locality,
          zip: order.billingAddress.postalCode,
          country_code: order.billingAddress.countryCode,
        },
        customer_ip: order.ipAddress,
      },
      transaction: {
        test_mode: Number(config.testMode),
        payment_type: 'GOOGLEPAY',
        amount: order.totalInt,
        currency: order.currency,
        order_no: order.id,
        payment_data: {
          wallet_data: JSON.stringify(order.paymentToken),
        },
      },
    }),
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