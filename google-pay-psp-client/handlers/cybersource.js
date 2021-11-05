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

const cybersource = require("cybersource-rest-client");
const { getLogger } = require("../patch-logger");

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://docs.cybersource.com/en/payments-tech-docs/googlepay.html

  cybersource.Logger.getLogger = getLogger;

  const client = new cybersource.PaymentsApi(
    {
      authenticationType: config.authenticationType,
      runEnvironment: config.runEnvironment,
      merchantID: config.merchantID,
      merchantKeyId: config.merchantKeyId,
      merchantsecretKey: config.merchantsecretKey,
      enableLog: false,
    },
    new cybersource.ApiClient()
  );

  const paymentRequest = {
    processingInformation: {
      paymentSolution: "012", // signifies Google Pay being used
    },
    orderInformation: {
      amountDetails: {
        currency: order.currency.toUpperCase(),
        totalAmount: String(order.totalFixed),
      },
    },
    paymentInformation: {
      fluidData: {
        value: Buffer.from(JSON.stringify(order.paymentToken)).toString(
          "base64"
        ),
      },
    },
  };

  return new Promise((resolve, reject) => {
    client.createPayment(paymentRequest, function (error, data, response) {
      if (!error) {
        resolve(data);
      } else {
        reject(error);
      }
    });
  });
};
