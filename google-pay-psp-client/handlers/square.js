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

const square = require('square');
const uuid = require('uuid');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://developer.squareup.com/reference/square/payments-api/create-payment

  const client = new square.Client({
    environment: square.Environment[config.environment],
    accessToken: config.accessToken,
  });

  return client.paymentsApi.createPayment({
    sourceId: order.paymentToken,
    idempotencyKey: uuid.v4(),
    amountMoney: {
      amount: order.totalInt,
      currency: order.currency.toUpperCase(),
    },
  });
};
