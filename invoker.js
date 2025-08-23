// invoker.js
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
const soap = require('soap');
const https = require('https');
const XypSign = require('./XypSign');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/', async (req, res) => {
    try {
        const { wsdl, method, payload } = req.body;

        const keyPath = process.env.KEY_PATH;
        const accessToken = process.env.ACCESS_TOKEN;
        const sign = new XypSign(keyPath, accessToken);
        const signingInfo = sign.sign();

        const agent = new https.Agent({  
          rejectUnauthorized: false
        });

        const options = {
            wsdl_options: {
                httpsAgent: agent
            },
        };

        const client = await soap.createClientAsync(wsdl, options);

        const endpoint = wsdl.replace('?WSDL', '');
        client.setEndpoint(endpoint);

        client.addHttpHeader('accessToken', signingInfo.accessToken);
        client.addHttpHeader('timeStamp', signingInfo.timeStamp);
        client.addHttpHeader('signature', signingInfo.signature);

        const result = await client[method + 'Async'](payload);

        // Process the response to remove attributes
        const cleanedResult = result[0];
        if (cleanedResult.return && cleanedResult.return.request && cleanedResult.return.request.attributes) {
            delete cleanedResult.return.request.attributes;
        }
        if (cleanedResult.return && cleanedResult.return.response && cleanedResult.return.response.attributes) {
            delete cleanedResult.return.response.attributes;
        }

        res.json(cleanedResult);
    } catch (ex) {
        console.error('Error processing request:', ex);
        res.status(403).json(ex.message);
    }
});

module.exports = app;