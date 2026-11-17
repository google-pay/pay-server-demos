/*
 * Copyright 2026 Google Inc.
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

const API_URL = 'https://api.monei.com/v1';

module.exports = async (config, order) => {
  // See PSP's docs for full API details:
  // https://docs.monei.com/payment-methods/google-pay

  const request = async (path, body) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  };

  const payment = await request('/payments', {
    amount: order.totalInt,
    currency: order.currency,
    orderId: order.id,
    description: order.description || undefined,
    customer: order.email ? { email: order.email } : undefined,
  });

  // MONEI expects the Google Pay token as a base64-encoded JSON string.
  const googlePayToken = order.paymentResponse
    ? order.paymentResponse.paymentMethodData.tokenizationData.token
    : typeof order.paymentToken === 'string'
    ? order.paymentToken
    : JSON.stringify(order.paymentToken);
  const { paymentToken } = await request('/tokens', {
    paymentId: payment.id,
    paymentMethod: { googlePay: { token: Buffer.from(googlePayToken).toString('base64') } },
  });

  const result = await request(`/payments/${payment.id}/confirm`, { paymentToken });
  if (result.status === 'FAILED') {
    throw result;
  }
  // A PENDING payment carries a nextAction.redirectUrl for 3D Secure, which PAN_ONLY cards can require.
  return result;
};
