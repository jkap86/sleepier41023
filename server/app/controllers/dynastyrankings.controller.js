'use strict'
const db = require("../models");
const DynastyRankings = db.dynastyrankings;
const https = require('https');
const axios = require('axios').create({
    headers: {
        'content-type': 'application/json'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true }),
    timeout: 2000
});
const axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 3 })

exports.find = async (req, res) => {
    const values = await DynastyRankings.findAll({

    })
    res.send(values)
}