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

// Stores product names mapped to quantities.
let cart = JSON.parse(localStorage.getItem('cart') || '{}');
let cartTotal = 0;

// Stores all the available products on page load, retrieved from products.json
const products = {};

// Environment passed to google.payments.api.PaymentsClient()
const googlePayEnv = 'TEST';

const gateway = location.search.substr(1);

// Payload for Google Pay requests - modify as required, particularly
// merchantInfo and tokenizationSpecification.parameters, the 'gateway' value
// is also leveraged in this demo to determine the gateway to use server-side.
const googlePayBaseConfiguration = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'],
        billingAddressRequired: true,
        billingAddressParameters: {
          format: 'FULL',
        },
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
      },
    },
  ],
  merchantInfo: {
    merchantId: '01234567890123456789',
    merchantName: 'Example Merchant',
  },
  emailRequired: true,
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function el(id) {
  return document.getElementById(id);
}

function jsonBody(body) {
  return {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };
}

function fetchJson(url, body) {
  return fetch(url, body).then(response => response.json());
}

function addSelectOptions(select, options) {
  options.sort().forEach(value => {
    const option = document.createElement('option');
    option.text = value;
    select.add(option);
  });
}

// Shows product details when product chosen from select element.
function showProduct() {
  const title = el('products').value;
  const product = products[title];
  if (product) {
    el('title').innerHTML = title;
    el('price').innerHTML = 'Price: ' + currencyFormatter.format(product.price);
    el('image').src = product.image;
  }
  el('quantity-container').style.display = product ? 'block' : 'none';
}

function showCart() {
  const details = el('cart-details');
  details.innerHTML = '';
  cartTotal = 0;
  Object.keys(cart).forEach(title => {
    cartTotal += products[title].price * cart[title];
    details.innerHTML += `
      <img src="${products[title].image}">
      ${cart[title]} x ${title}
      <button onclick="removeProduct('${title}');">x</button>
      <br>`;
  });
  details.innerHTML += cartTotal > 0 ? `<br>Total: ${currencyFormatter.format(cartTotal)}` : 'Cart is empty';
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Adds product/quantity to cart when "Add" clicked.
function addProduct() {
  el('cart').style.display = 'inline-block';
  el('order').style.display = 'none';
  const title = el('products').value;
  const quantity = parseFloat(el('quantity').value);
  cart[title] = (cart[title] || 0) + quantity;
  saveCart();
  showCart();
}

// Remove a product from cart.
function removeProduct(title) {
  delete cart[title];
  saveCart();
  showCart();
}

// Empties cart when "Clear" clicked.
function removeAllProducts() {
  cart = {};
  saveCart();
  showCart();
}

// NOTE: This method of loading a script has no way of ensuring the script has
// been loaded before being referenced. For a more robust approach, use
// something like: https://github.com/google-pay/gpay-loyaltyapi-demo/blob/main/www/src/utils/load-script.js
function loadScript(src) {
  const script = document.createElement('script');
  script.src = src;
  document.getElementsByTagName('head')[0].appendChild(script);
}

const googlePayClient = new google.payments.api.PaymentsClient({ environment: googlePayEnv });

function onGooglePayIsReadyToPay(response) {
  if (response.result) {
    const googlePayButton = googlePayClient.createButton({
      onClick: () => onGooglePayButtonClick(), // must be wrapped so can be overridden
    });
    el('gpay-container').appendChild(googlePayButton);
  }
}

function showGooglePayButton() {
  el('gpay-container').style.display = 'block';
}

function onGooglePayButtonClick() {
  const paymentRequest = Object.assign({}, googlePayBaseConfiguration);
  paymentRequest.transactionInfo = {
    totalPriceStatus: 'FINAL',
    totalPrice: String(cartTotal.toFixed(2)),
    currencyCode: 'USD',
    countryCode: 'US',
  };
  googlePayClient.loadPaymentData(paymentRequest).then(onGooglePayPaymentLoaded).catch(console.error);
}

// When paymentToken received from Google Pay, passes the token and cart to the
// server-side payment gateway.
function onGooglePayPaymentLoaded(paymentResponse) {
  console.log('paymentResponse received', paymentResponse);
  fetchJson(`/gateways/${gateway}/orders`, jsonBody({ paymentResponse: paymentResponse, cart: cart })).then(
    response => {
      removeAllProducts();
      el('cart').style.display = 'none';
      el('order').style.display = 'inline-block';
      el('order-details').innerHTML = JSON.stringify(response, null, 2);
    },
  );
}

function loadShop() {
  el('container').style.display = 'inline-block';
  el('products').addEventListener('change', showProduct);
  el('add').addEventListener('click', addProduct);
  el('clear').addEventListener('click', removeAllProducts);
  el('checkout').addEventListener('click', () => showGooglePayButton());

  fetchJson('/products.json').then(response => {
    Object.assign(products, response);
    addSelectOptions(el('products'), Object.keys(products));
    showCart();
  });

  fetchJson(`/gateways/${gateway}?script=true`).then(response => {
    console.log('gateway config loaded', response);
    if (response.script) {
      loadScript(`/handlers/${gateway}.js`);
    }
    delete response.script;
    googlePayBaseConfiguration.allowedPaymentMethods[0].tokenizationSpecification.parameters = response;
    googlePayClient
      .isReadyToPay(googlePayBaseConfiguration)
      .then(response => onGooglePayIsReadyToPay(response))
      .catch(console.error);
  });
}

window.addEventListener('load', () => {
  fetchJson('/gateways/').then(response => {
    const select = el('gateways');
    addSelectOptions(select, response);
    select.addEventListener('change', e => {
      location.search = e.target.selectedIndex > 0 ? e.target[e.target.selectedIndex].value : '';
    });
    select.selectedIndex = response.sort().indexOf(gateway) + 1;
    if (select.selectedIndex > 0) {
      loadShop();
    }
  });
});
