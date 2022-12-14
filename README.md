# Google Pay Server Demos

This project demonstrates integrating Google Pay with various Payments Service Providers (PSPs), using JavaScript and
Node.js. It consists of two parts: a client library that wraps each of the PSP server-side APIs, and a demo app
that demonstrates end to end integration for any of the included PSPs.

If you're just interested in sample code for a particular PSP, go straight to the `google-pay-psp-client/handlers` directory,
where you'll find server-side samples for each PSP.

## Demo App

The demo app is implemented as a minimal shopping site you can use to test the end to end integration for your chosen
PSP.

**Setup:**

- Copy `demo/config.json.example` to `demo/config.json` and edit the config for your PSP
- Install dependencies: `npm install .`
- Run the app: `node demo/app.js`
- View at `http://localhost:3000`

## Client Library

The `google-pay-psp-client` directory contains a client library that wraps each of the PSP server-side APIs.

**Example:**

```js
const clients = require('./google-pay-psp-client');

// PSP-specific configuration, in this case Braintree.
const config = {
  environment: 'Sandbox',
  merchantId: 'merchant id',
  publicKey: 'public key',
  privateKey: 'private key',
};

// An order requires a total, currency, and
// client-side response from the Google Pay API.
const order = {
  total: 100,
  currency: 'USD',
  paymentResponse: req.body.paymentResponse,
};

// Each PSP has a "pay" method, which takes config, order, and returns a Promise.
clients.braintree
  .pay(config, order)
  .then(response => {
    console.log(response); // PSP-specific response.
  })
  .catch(error => {
    console.error(error); // PSP-specific error.
  });
```

## Current PSPs

- [Adyen](https://docs.adyen.com/payment-methods/google-pay/api-only)
- [Barion](https://docs.barion.com/Google_Pay)
- [BePaid](https://docs.bepaid.by/ru/google_pay/integration/owncheckout)
- [BlueSnap](https://developers.bluesnap.com/reference/google-pay#section-implementing-google-pay-in-your-website)
- [Braintree](https://developer.paypal.com/braintree/docs/guides/google-pay/overview)
- [Braspag](https://braspag.github.io/en/manual/ewallets)
- [Checkout.com](https://docs.checkout.com/payments/payment-methods/wallets/google-pay)
- [Cybersource](https://docs.cybersource.com/en/payments-tech-docs/googlepay.html)
- [Datatrans](https://docs.datatrans.ch/docs/payment-methods#section-google-pay)
- [Ecommpay](https://developers.ecommpay.com/en/pm_googlepay.html)
- [Novalnet](https://developer.novalnet.de/onlinepayments/aboutgooglepay)
- [Payeezy (Fiserv / First Data)](https://github.com/payeezy/get_started_with_payeezy)
- [PayU](https://developers.payu.com/en/google_pay.html)
- [Solid](https://dev.solidgate.com/developers/documentation/introduction/Host-to-host-API)
- [Spreedly](https://docs.spreedly.com/guides/google-pay)
- [Square](https://developer.squareup.com/docs/payment-form/add-digital-wallets/google-pay)
- [Stripe](https://stripe.com/docs/google-pay)
- [WayForPay](https://help.wayforpay.com/google-pay)
- [Windcave](https://www.windcave.com/developer-ecommerce-google-pay)
- [Worldpay](https://developer.worldpay.com/docs/wpg/directintegration/quickstart)

Don't see your PSP here? Feel free to contribute an integration example using the steps below.

## Adding a new PSP

**Client Library:**

Add a new JavaScript file to the `google-pay-psp-client/handlers` directory. It should export a single function that
accepts a `config` and an `order` object (see examples of these in the "Client Library" section above). The function
should return a Promise that resolves on successful payment, and rejects on failure. The `order` object will contain
some calculated fields for the total amount:

- `order.totalInt` the total amount in smallest possible units, (eg cents for USD)
- `order.totalFixed` the rounded total amount (eg 2 decimal places for USD)

**Demo App:**

Add a new key to `demo/config.json` for the PSP, using the same name as the JavaScript file name added to the client
library. Use this to store all configuration variables used by the PSP, at minimum containing a `clientConfig` key
containing the [gateway parameters](https://developers.google.com/pay/api/web/reference/request-objects#gateway) for the
PSP.

Optionally, if custom client-side integration is required, add a new JavaScript file to the `demo/public/handlers`
directory. It should be named the same as the key added to `config.json`, and it will be run once the page's dom is
loaded. You can then override the function names in `demo/public/shop.js`. See the `demo/public/handlers` directory for
examples.
