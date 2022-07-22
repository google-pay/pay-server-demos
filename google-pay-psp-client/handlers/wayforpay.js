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

const WayForPay = require('wayforpay');

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://help.wayforpay.com/google-pay

  const client = new WayForPay(config.merchantAccount, config.secretKey);

  return new Promise((resolve, reject) => {
    client.charge({
      merchantDomainName: order.host,
      orderReference: order.id,
      orderDate: new Date().getTime(),
      amount: order.totalFixed,
      currency: order.currency,
      productName: order.items.map(item => item.title),
      productCount: order.items.map(item => item.quantity),
      productPrice: order.items.map(item => item.totalFixed),
      gpApiVersionMinor: order.paymentResponse.apiVersionMinor,
      gpApiVersion: order.paymentResponse.apiVersion,
      gpPMDescription: order.paymentResponse.paymentMethodData.description,
      gpPMType: order.paymentResponse.paymentMethodData.type,
      gpPMTCardNetwork: order.paymentResponse.paymentMethodData.info.cardNetwork,
      gpPMTCardDetails: order.paymentResponse.paymentMethodData.info.cardDetails,
      gpTokenizationType: order.paymentResponse.paymentMethodData.tokenizationData.type,
      gpToken: order.paymentResponse.paymentMethodData.tokenizationData.token,
    }, (response) => {
      try {
        response = JSON.parse(response);
        if (response.reasonCode === 1100) {
          resolve(response);
          return;
        }
      } catch (e) {}
      reject(response);
    });
  });
};


