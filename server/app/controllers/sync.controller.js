'use strict'
const db = require("../models");
const ALLPLAYERS = require('../../allplayers.json');
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

exports.boot = async (app) => {
    const date = new Date()
    const tzOffset = date.getTimezoneOffset()
    const tzOffset_ms = tzOffset * 60 * 1000
    const date_tz = new Date(date + tzOffset_ms)
    const hour = date_tz.getHours()
    const minute = date_tz.getMinutes()

    let delay;
    if (hour < 3) {
        delay = (((3 - hour) * 60) + (60 - minute)) * 60 * 1000
    } else {
        delay = (((27 - hour) * 60) + (60 - minute)) * 60 * 1000
    }

    const state = await axios.get('https://api.sleeper.app/v1/state/nfl')
    app.set('state', state.data)

    const allplayers = await getAllPlayers()
    app.set('allplayers', allplayers)

    const nflschedule = await axios.get(`https://api.myfantasyleague.com/2022/export?TYPE=nflSchedule&W=ALL&JSON=1`)

    const schedule = {}

    nflschedule.data.fullNflSchedule.nflSchedule.map(matchups_week => {
        return schedule[matchups_week.week] = matchups_week.matchup
    })
    app.set('schedule', schedule)

    app.set('leaguemate_leagues', [])
    app.set('leaguemates', [])
    app.set('updated_leaguemates', [])
    app.set('trades_sync_counter', 0)

    setTimeout(async () => {
        setInterval(async () => {

            const state = await axios.get('https://api.sleeper.app/v1/state/nfl')
            app.set('state', state.data)

            const allplayers = await getAllPlayers()
            app.set('allplayers', allplayers)

        }, 24 * 60 * 60 * 1 * 1000)
    }, delay)

    console.log('Server Boot Complete...')
    return
}

const getAllPlayers = async () => {
    let sleeper_players;
    if (process.env.DATABASE_URL) {
        try {
            sleeper_players = await axios.get('https://api.sleeper.app/v1/players/nfl')
            sleeper_players = sleeper_players.data

        } catch (error) {
            console.log(error)
        }
    } else {
        console.log('getting allplayers from file...')

        sleeper_players = ALLPLAYERS
    }


    return sleeper_players
}