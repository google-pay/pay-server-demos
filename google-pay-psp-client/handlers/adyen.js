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

const adyen = require('@adyen/api-library');
const uuid = require('uuid');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://docs.adyen.com/payment-methods/google-pay/api-only

  const adyenConfig = new adyen.Config();
  adyenConfig.apiKey = config.apiKey;
  adyenConfig.merchantAccount = config.merchantAccount;

  const client = new adyen.Client({adyenConfig});
  client.setEnvironment(config.environment);

  const checkout = new adyen.CheckoutAPI(client);

  return checkout.payments({
    amount: {
      currency: order.currency.toUpperCase(),
      value: order.totalInt,
    },
    paymentMethod: {
      type: 'paywithgoogle', // signifies Google Pay being used
      googlePayToken: JSON.stringify(order.paymentToken)
    },
    reference: uuid.v4(),
    merchantAccount: config.merchantAccount,
  });
};
