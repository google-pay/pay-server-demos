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

const solidGate = require('@solidgate/node-sdk');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://dev.solidgate.com/developers/documentation/introduction/Host-to-host-API

  const client = new solidGate.Api(config.merchantId, config.privateKey, config.url);

  return client.googlePay({
    platform: 'WEB',
    amount: order.totalInt,
    currency: order.currency,
    customer_email: order.email,
    order_description: order.description,
    order_id: order.id,
    ip_address: order.ipAddress,
    signedMessage: order.paymentToken.signedMessage,
    protocolVersion: order.paymentToken.protocolVersion,
    signature: order.paymentToken.signature,
  });
};
