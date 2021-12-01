const shortid = require('shortid');
const fetch = require('node-fetch');

module.exports = (config, order) => {

  const requestData = {
    currency: order.currency,
    amount: order.totalInt,
    PAY: order.paymentToken,
    refno: shortid.generate()
  };

  const host = config.environment === 'sandbox' ? 'api.sandbox' : 'api';
  const auth = Buffer.from(`${config.clientConfig.gatewayMerchantId}:${config.apiKey}`).toString('base64');

  return fetch(`https://${host}.datatrans.com/v1/transactions/authorize`, {
    method: "POST",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`
    }
  }).then(response => {
    if (response.ok) {
      return Promise.resolve(response.json());
    } else {
      return Promise.reject(response.json());
    }
  });
};
