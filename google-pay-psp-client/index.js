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

const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const precisions = require('./precisions.js');

const handlers = path.resolve(__dirname, 'handlers');

fs.readdirSync(handlers).forEach(file => {
  const name = file.split('.')[0];
  const handler = require(path.resolve(handlers, name));

  module.exports[name] = {
    pay: (config, order) =>
      new Promise((resolve, reject) => {
        const validate = (condition, message) => {
          if (condition) reject({ error: message });
        };

        validate(typeof config !== 'object', 'config not provided');
        validate(typeof order !== 'object', 'order not provided');
        validate(
          isNaN(order.total) && (!order.items || isNaN(order.items[0].price)),
          'order contains neither numeric total, or items with numeric price',
        );
        validate(!precisions[order.currency], 'invalid currency provided');
        validate(!order.paymentToken, 'paymentToken not provided');

        if (!order.paymentToken && order.paymentResponse) {
          order.paymentToken = order.paymentResponse.paymentMethodData.tokenizationData.token;
        }

        if (!order.email && order.paymentResponse) {
          order.email = order.paymentResponse.email;
        }

        if (!order.billingAddress && order.paymentResponse) {
          order.billingAddress = order.paymentResponse.paymentMethodData.info.billingAddress;
          if (order.billingAddress) {
            order.billingAddress.street = [
              order.billingAddress.address1,
              order.billingAddress.address2,
              order.billingAddress.address3,
            ]
              .filter(s => s.length > 0)
              .join(' ');
          }
        }

        const withTotals = obj => {
          const total = Number(obj.total || obj.price * obj.quantity);
          obj.totalInt = Math.round(total * Math.pow(10, precisions[order.currency]));
          obj.totalFixed = total.toFixed(precisions[order.currency]);
          return obj;
        };

        order.id ||= uuid.v4();
        order.total ||= order.items.reduce((total, item) => {
          return total + item.price * item.quantity;
        }, 0);
        order.items = !order.items ? [] : order.items.map(withTotals);
        order.description = order.items.map(item => `${item.quantity} x ${item.title}`).join(', ');
        order = withTotals(order);

        if (typeof order.paymentToken === 'string') {
          try {
            const paymentToken = JSON.parse(order.paymentToken);
            order.paymentToken = paymentToken;
          } catch (ex) {
            // handle error as required
          }
        }

        return resolve(handler(config, order));
      }),

    stringify: object => {
      return JSON.stringify(object, (k, v) => (typeof v === 'bigint' ? Number(v) : v));
    },
  };
});
