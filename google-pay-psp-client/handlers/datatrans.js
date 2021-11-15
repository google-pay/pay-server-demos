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

const shortid = require('shortid');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = (config, order) => {

    const requestData = {
        currency: order.currency,
        amount: order.totalInt,
        PAY: order.paymentToken,
        refno: shortid.generate()
    };

    return fetch("https://api" + (config.environment === 'sandbox' ? ".sandbox" : "") + ".datatrans.com/v1/transactions/authorize", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + Buffer.from(config.clientConfig.gatewayMerchantId + ":" + config.apiKey).toString('base64')
        }
    }).then(response => {
        if (response.ok) {
            return Promise.resolve(response.json());
        } else {
            return Promise.reject(response.json());
        }
    });
};