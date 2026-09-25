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

// Replace existing onGooglePayButtonClick to prevent it from being called,
// since the Square wrapper adds its own click handler.
function onGooglePayButtonClick() {
  return false;
}

function removeGooglePayButton() {
  const gPayContainer = el('gpay-container');
  if (gPayContainer.children.length === 0) return;

  gPayContainer.removeChild(gPayContainer.firstChild);
}

async function showGooglePayButton() {
  const config = googlePayBaseConfiguration.allowedPaymentMethods[0].tokenizationSpecification.parameters;

  const payments = Square.payments(config.applicationId, config.locationId);

  const lineItems = Object.keys(cart).map(title => {
    return {
      amount: String(products[title].price * cart[title]),
      label: title,
      pending: false,
    };
  });

  const request = payments.paymentRequest({
    countryCode: 'US',
    currencyCode: 'USD',
    lineItems,
    total: {
      label: 'Total',
      amount: String(parseFloat(cartTotal).toFixed(2)),
      pending: false,
    },
  });
  const googlePay = await payments.googlePay(request);

  async function tokenize() {
    const result = await googlePay.tokenize();
    onGooglePayPaymentLoaded(JSON.stringify(result.token));
    el('gpay-container').removeEventListener('click', tokenize);
    removeGooglePayButton();
  }

  removeGooglePayButton();
  el('gpay-container').style.display = 'block';
  googlePay.attach('#gpay-container');

  el('gpay-container').addEventListener('click', tokenize);
}

loadScript('https://sandbox.web.squarecdn.com/v1/square.js');
