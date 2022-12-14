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

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://docs.spreedly.com/guides/google-pay

  const client = require('spreedly-api')(config.environmentKey, config.accessSecret);

  // Spreedy requires a permanent gateway token which is
  // obtainable via the Spreedly API. In our case we expect
  // the token to be set in config.json. The following commented
  // snippet creates a test token. Consult the Spreedly docs for
  // more info.
  // client.gateways.create({
  //   'gateway': {
  //     'gateway_type': 'test'
  //   }
  // }, function (error, response) {
  //   if (error) {
  //     console.log('error ', error);
  //     return;
  //   }
  //   console.log('response', response);
  // });

  return new Promise((resolve, reject) => {
    client.purchase.create(
      config.gatewayToken,
      {
        transaction: {
          amount: order.totalInt,
          currency_code: order.currency,
          google_pay: {
            payment_data: order.paymentToken,
          },
        },
      },
      function (error, response) {
        if (!error) {
          resolve(response);
        } else {
          reject(error);
        }
      },
    );
  });
};
