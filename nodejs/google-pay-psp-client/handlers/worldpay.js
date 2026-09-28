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

const fetch = require('node-fetch');
const xml2js = require('xml2js').parseString;

const escapeXml = unsafe => {
  if (unsafe === undefined || unsafe === null) {
    return '';
  }
  return String(unsafe).replace(/[<>&'"]/g, c => {
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '&') return '&amp;';
    if (c.charCodeAt(0) === 39) return '&apos;';
    if (c.charCodeAt(0) === 34) return '&quot;';
    return c;
  });
};

const createXml = (config, order) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE paymentService PUBLIC "-//WorldPay/DTD WorldPay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
<paymentService version="1.4" merchantCode="${escapeXml(config.merchantCode)}">
    <submit>
        <order orderCode="${escapeXml(order.id)}">
            <description>${escapeXml(order.description)}</description>
            <amount value="${escapeXml(order.totalInt)}" currencyCode="${escapeXml(order.currency)}" exponent="2"/>
            <paymentDetails>
                <PAYWITHGOOGLE-SSL>
                    <protocolVersion>${escapeXml(order.paymentToken.protocolVersion)}</protocolVersion>
                    <signature>${escapeXml(order.paymentToken.signature)}</signature>
                    <signedMessage>${escapeXml(order.paymentToken.signedMessage)}</signedMessage>
                </PAYWITHGOOGLE-SSL>
            </paymentDetails>
        </order>
    </submit>
</paymentService>`;

module.exports = (config, order) => {
  // See PSP's docs for full API details:
  // https://developer.worldpay.com/docs/wpg/directintegration/quickstart

  let ok;

  return fetch(config.url, {
    method: 'POST',
    headers: {
      'content-type': 'text/xml',
      'Authorization': 'Basic ' + Buffer.from(`${config.newUsername}:${config.xmlPassword}`).toString('base64'),
    },
    body: createXml(config, order),
  })
    .then(response => {
      ok = response.ok;
      return response.json();
    })
    .then(response => {
      if (ok) {
        xml2js(response, (err, json) => {
          json = json.paymentService.reply[0];
          if (!json.error) {
            Promise.resolve(json);
          } else {
            Promise.reject(json);
          }
        });
      } else {
        return Promise.reject(response);
      }
    });
};
