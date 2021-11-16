const shortid = require('shortid');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = (config, order) => {

    const requestData = {
        currency: order.currency,
        amount: order.totalInt,
        PAY: order.paymentToken,
        refno: shortid.generate()
    };

    return fetch(`https://api${config.environment === 'sandbox' ? '.sandbox' : ''}.datatrans.com/v1/transactions/authorize`, {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${Buffer.from(`${config.clientConfig.gatewayMerchantId}:${config.apiKey}`).toString('base64')}`
        }
    }).then(response => {
        if (response.ok) {
            return Promise.resolve(response.json());
        } else {
            return Promise.reject(response.json());
        }
    });
};
