'use strict'
const db = require("../models");
const Sequelize = db.Sequelize;
const sequelize = db.sequelize;
const User = db.users;
const Op = db.Sequelize.Op
const League = db.leagues;
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

exports.findMostLeagues = async (req, res) => {

    try {


        const users = await User.findAll({
            attributes: [
                'username',
                'avatar',
                [Sequelize.fn('COUNT', Sequelize.col('leagues.league_id')), 'leaguesCount']
            ],
            include: [{
                model: League,
                attributes: [],
                through: {
                    attributes: []
                },
                required: true
            }],
            order: [['leaguesCount', 'DESC']],
            group: ['user.user_id']
        })


        res.send(users.slice(0, 100))
    } catch (err) {
        console.log(err)
    }

} 