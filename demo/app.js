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

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const requestIp = require('request-ip');
const clients = require('../google-pay-psp-client');
const configs = require('./config.js');
const products = require('./public/products.json');

const relativePath = (...parts) => path.resolve(__dirname, ...parts);

const app = express();
app.use(express.static(relativePath('public')));
app.use(cors({ origin: process.env.PAY_DEMO_CORS_ACCESS_LIST }));
app.use(bodyParser.json());

// return a list of gateways
app.get('/gateways/', (req, res) => {
  res.send(
    Object.keys(configs).filter(name => {
      return configs[name].clientConfig != undefined;
    }),
  );
});

// return client-side config for a gateway
app.get('/gateways/:gateway', (req, res) => {
  let config;
  try {
    config = configs[req.params.gateway].clientConfig;
  } catch (e) {
    res.status(404).send('Not found');
    return;
  }
  fs.exists(relativePath('public', 'handlers', `${req.params.gateway}.js`), script => {
    delete config.script;
    if (req.query.script === 'true') {
      config.script = script;
    }
    res.send(config);
  });
});

// make a payment for a gateway
app.post('/gateways/:gateway/orders', (req, res) => {
  // Create the order object passed to the handler.
  // NOTE: Cart total gets calculated here (via PSP client),
  // not client-side since doing so could be manipulated.
  const order = {
    currency: process.env.PAY_DEMO_CURRENCY || 'USD',
    ipAddress: requestIp.getClientIp(req),
    host: req.hostname,
    paymentResponse: req.body.paymentResponse,
    items: Object.keys(req.body.cart).map(title => {
      return {
        title: title,
        quantity: req.body.cart[title],
        price: products[title].price,
      };
    }),
  };

  const client = clients[req.params.gateway];
  const config = configs[req.params.gateway];

  if (!client) {
    res.status(404).send('Not found');
    return;
  }

  client
    .pay(config, order)
    .then(response => {
      res.send(client.stringify(response));
    })
    .catch(err => {
      console.error(err);
      res.status(500).send(client.stringify(err));
    });
});

app.listen(3000);
