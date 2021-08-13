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

function showGooglePayButton() {

  const config = googlePayBaseConfiguration.allowedPaymentMethods[0]
        .tokenizationSpecification.parameters;

  const paymentForm = new SqPaymentForm({
    applicationId: config.applicationId,
    locationId: config.locationId,
    googlePay: {elementId: 'gpay-container'},
    callbacks: {

      cardNonceResponseReceived: (errors, nonce, cardData) => {
        if (errors) {
          errors.forEach(console.error);
        } else {
          onGooglePayPaymentLoaded(JSON.stringify(nonce));
        }
      },

      methodsSupported: (methods, unsupportedReason) => {
        if (methods.googlePay === true) {
          el('gpay-container').style.display = 'block';
        } else if (methods.googlePay === false) {
          console.error(unsupportedReason);
        }
      },

      createPaymentRequest: () => {
        return {
          currencyCode: "USD",
          countryCode: "US",
          total: {
            amount: String(cartTotal),
            pending: false
          },
        };
      },

    }
  });

  paymentForm.build();
}

loadScript('https://js.squareupsandbox.com/v2/paymentform');
