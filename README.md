# Google Pay Server Demos

This project demonstrates integrating Google Pay with various Payments Service Providers (PSPs), using JavaScript and
Node.js. It consists of two parts: a client library that wraps each of the PSP server-side integrations, and a demo app
that demonstrates end to end integration for each PSP.

If you're just interested in sample code for your PSP, go straight to the `google-pay-psp-client/handlers` directory,
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

The `google-pay-psp-client` directory contains a client library that wraps each of the PSP server-side integrations.

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

// An order requires a total, client-side Google Pay token, and currency.
const order = {
  total: 100,
  currency: 'USD',
  paymentToken: JSON.parse(req.body.paymentToken),
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

- Adyen
- Braintree
- Checkout.com
- Cybersource
- Datatrans
- Payeezy (Fiserv / First Data)
- Square
- Stripe

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
