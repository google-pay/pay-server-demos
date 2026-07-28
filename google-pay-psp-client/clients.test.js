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

const mockStripe = jest.fn().mockImplementation((config, order) => {
  return Promise.resolve({ success: true });
});
jest.mock('./handlers/stripe.js', () => mockStripe);

const mockFetch = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve('<paymentService><reply><success/></reply></paymentService>'),
  });
});
jest.mock('node-fetch', () => mockFetch);

const client = require('./index.js').braintree;
const stripeClient = require('./index.js').stripe;

// Each array item is a test case expecting an error:
// description, config arg, order arg, expected error.
[
  ['client requires config', undefined, undefined, 'config not provided'],
  ['client requires order', {}, undefined, 'order not provided'],
  [
    'client requires numeric order total',
    {},
    { total: 'x' },
    'order contains neither numeric total, or items with numeric price',
  ],
  ['client requires valid currency', {}, { total: 1, currency: 'foo' }, 'invalid currency provided'],
  ['client requires paymentToken', {}, { total: 1, currency: 'USD' }, 'paymentToken not provided'],
].forEach(item => {
  test(item[0], () => {
    return expect(client.pay(item[1], item[2])).rejects.toHaveProperty('error', item[3]);
  });
});

describe('Validation flow and phantom charges prevention', () => {
  beforeEach(() => {
    mockStripe.mockClear();
  });

  test('should not invoke handler if config is missing', async () => {
    await expect(stripeClient.pay(undefined, {})).rejects.toHaveProperty('error', 'config not provided');
    expect(mockStripe).not.toHaveBeenCalled();
  });

  test('should not invoke handler if order has an invalid currency', async () => {
    await expect(stripeClient.pay({}, { total: 10, currency: 'invalid' })).rejects.toHaveProperty(
      'error',
      'invalid currency provided',
    );
    expect(mockStripe).not.toHaveBeenCalled();
  });

  test('should successfully extract paymentToken from paymentResponse and invoke handler', async () => {
    const config = { secretKey: 'sk_test_123' };
    const order = {
      total: 10,
      currency: 'USD',
      paymentResponse: {
        paymentMethodData: {
          tokenizationData: {
            token: '{"id": "tok_123"}',
          },
          info: {
            billingAddress: {
              address1: '123 Main St',
              address2: 'Suite 100',
              address3: '',
            },
          },
        },
        email: 'customer@example.com',
      },
    };

    const result = await stripeClient.pay(config, order);
    expect(result).toEqual({ success: true });
    expect(mockStripe).toHaveBeenCalledTimes(1);
    const [passedConfig, passedOrder] = mockStripe.mock.calls[0];
    expect(passedConfig).toEqual(config);
    expect(passedOrder.paymentToken).toEqual({ id: 'tok_123' });
    expect(passedOrder.email).toEqual('customer@example.com');
    expect(passedOrder.billingAddress.street).toEqual('123 Main St Suite 100');
  });
});

describe('Worldpay handler XML injection prevention', () => {
  const worldpayClient = require('./index.js').worldpay;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('should escape special XML characters in order description and paymentToken fields', async () => {
    const config = {
      merchantCode: 'MERCHANT123',
      newUsername: 'user',
      xmlPassword: 'pass',
      url: 'https://secure-test.worldpay.com/jsp/merchant/xml/paymentService.jsp',
    };

    const order = {
      id: 'order-123',
      total: 10,
      currency: 'USD',
      items: [
        {
          title: '</description><amount value="1" currencyCode="USD" exponent="2"/><description>',
          quantity: 1,
          price: 10,
        },
      ],
      paymentToken: {
        protocolVersion: '<injected-protocol>',
        signature: 'signature&signature',
        signedMessage: 'message"with"quotes',
      },
    };

    try {
      await worldpayClient.pay(config, order);
    } catch (e) {
      // Ignore potential xml2js parsing errors from mock return
    }

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [passedUrl, passedOptions] = mockFetch.mock.calls[0];
    expect(passedUrl).toBe(config.url);
    expect(passedOptions.method).toBe('POST');

    const xmlBody = passedOptions.body;

    // The injected elements should be escaped
    expect(xmlBody).not.toContain('</description><amount value="1"');
    expect(xmlBody).not.toContain('<injected-protocol>');
    expect(xmlBody).not.toContain('signature&signature');
    expect(xmlBody).not.toContain('message"with"quotes');

    // Instead, they should be present in their escaped forms
    expect(xmlBody).toContain('&lt;/description&gt;&lt;amount value=&quot;1&quot;');
    expect(xmlBody).toContain('&lt;injected-protocol&gt;');
    expect(xmlBody).toContain('signature&amp;signature');
    expect(xmlBody).toContain('message&quot;with&quot;quotes');
  });
});
