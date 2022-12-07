/*
 * Copyright 2022 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const payeezy = require('payeezy');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://github.com/payeezy/get_started_with_payeezy

  const client = payeezy(config.apiKey, config.apiSecret, config.merchantToken);
  client.host = config.host;
  client.version = 'v1';

  const requestData = {
    'currency_code': order.currency,
    'amount': String(order.totalInt),
    'transaction_type': 'purchase',
    'method': '3DS',
    '3DS': {
      signature: order.paymentToken.signature,
      type: 'G',
      version: order.paymentToken.protocolVersion,
      data: order.paymentToken.signedMessage,
    },
  };

  return new Promise((resolve, reject) => {
    client.transaction.purchase(requestData, function (error, response) {
      if (!error) {
        resolve(response);
      } else {
        reject(error);
      }
    });
  });
};
