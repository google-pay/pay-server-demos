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

const client = require('./index.js').braintree;

// Each array item is a test case expecting an error:
// description, config arg, order arg, expected error.
[
  ['client requires config', undefined, undefined, 'config not provided'],
  ['client requires order', {}, undefined, 'order not provided'],
  [
    'client requires numeric order total',
    {},
    { total: 'x' },
    'order contains neither numeric total, or items with numeric price',
  ],
  ['client requires valid currency', {}, { total: 1, currency: 'foo' }, 'invalid currency provided'],
  ['client requires paymentToken', {}, { total: 1, currency: 'USD' }, 'paymentToken not provided'],
].forEach(item => {
  test(item[0], () => {
    return expect(client.pay(item[1], item[2])).rejects.toHaveProperty('error', item[3]);
  });
});
