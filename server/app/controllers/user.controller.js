'use strict'
const db = require("../models");
const User = db.users;
const https = require('https');
const axios = require('axios').create({
    headers: {
        'content-type': 'application/json'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true }),
    timeout: 1000
});
const axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 3 })

exports.create = async (req, res) => {
    console.log(`***SEARCHING FOR ${req.body.username}***`)
    const user = await axios.get(`http://api.sleeper.app/v1/user/${req.body.username}`)

    if (user.data?.user_id) {
        const data = await User.upsert({
            user_id: user.data.user_id,
            username: user.data.display_name,
            avatar: user.data.avatar,
            type: 'S',
            updatedAt: new Date()

        })

        res.send(data)
    } else {
        res.send({ error: 'User not found' })
    }
}