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

const Barion = require('node-barion');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://docs.barion.com/Google_Pay

  const client = new Barion({
    POSKey: config.posKey,
    Environment: config.environment
  });

  const url = `${order.request.protocol}://${order.request.hostname}${order.request.originalUrl}`;

  return client.googlePay({
    PaymentRequestId: order.id,
    Currency: order.currency,
    PayerEmailAddress: order.email,
    PaymentType: 'Immediate',
    GooglePayToken: JSON.stringify(order.paymentToken),
    RedirectUrl: url,
    CallbackUrl: url,
    Transactions: [{
      POSTransactionId: order.id,
      Payee: order.email,
      Total: order.totalInt,
      Items: order.items.map(item => ({
        Name: item.title,
        Description: item.title,
        Unit: item.title,
        Quantity: item.quantity,
        UnitPrice: item.totalInt,
        ItemTotal: item.totalInt * item.quantity,
      })),
    }],
  });
};
