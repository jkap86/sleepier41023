'use strict'
const db = require("../models");
const User = db.users;
const Trade = db.trades;
const League = db.leagues;
const Op = db.Sequelize.Op
const queryInterface = db.sequelize.getQueryInterface();


exports.leaguemate = async (req, res) => {
    let filters = [];

    if (req.body.leaguemates) {
        filters.push({
            managers: {
                [Op.overlap]: req.body.leaguemates
            }
        })
    } else if (req.body.manager) {
        filters.push({
            managers: {
                [Op.contains]: [req.body.manager]
            }
        })
    }

    if (req.body.player) {

        const pick_split = req.body.player.split(' ')
        const season = pick_split[0]
        const round = parseInt(pick_split[1]?.split('.')[0])
        const order = parseInt(pick_split[1]?.split('.')[1])
        console.log({
            season: season,
            round: round,
            order: order
        })
        filters.push({
            [Op.or]: [
                {
                    adds: {
                        [req.body.player]: {
                            [Op.not]: null
                        }
                    }
                },
                {
                    draft_picks: {
                        [Op.contains]: [{
                            season: season,
                            round: round,
                            order: order
                        }]
                    }
                }
            ]

        })
    }

    let lmTrades;

    try {

        lmTrades = await Trade.findAndCountAll({
            order: [['status_updated', 'DESC']],
            offset: req.body.offset,
            limit: req.body.limit,
            where: {
                [Op.and]: filters
            },
            attributes: ['transaction_id', 'status_updated', 'rosters', 'managers', 'adds', 'drops', 'draft_picks', 'leagueLeagueId'],
            include: [
                {
                    model: League,
                    attributes: ['name', 'avatar', 'roster_positions', 'scoring_settings', 'settings']

                }
            ],
            raw: true
        })

    } catch (error) {
        console.log(error)
    }
    console.log({ LMTRADES: lmTrades.rows[0] })
    res.send(lmTrades)

}

exports.leaguemateLeagues = async (req, res) => {
    let filters = [];

    if (req.body.leaguemates) {
        filters.push({
            users: {
                [Op.overlap]: req.body.leaguemates
            }
        })
    } else if (req.body.manager) {
        filters.push({
            users: {
                [Op.contains]: [req.body.manager]
            }
        })
    }

    if (req.body.player) {

        filters.push({
            [Op.or]: [
                {
                    adds: {
                        [req.body.player]: {
                            [Op.not]: null
                        }
                    }
                }
            ]
        })
    }

    let lmLeaguesTrades;

    try {

        lmLeaguesTrades = await Trade.findAndCountAll({
            order: [['status_updated', 'DESC']],
            offset: req.body.offset,
            limit: req.body.limit,
            where: {
                [Op.and]: filters
            },
            include: [
                {
                    model: League,

                }
            ],
            indexHints: [{ type: 'USE', values: ['idx_lm_leagues_trades'] }]
        })
        /*
         lmLeaguesTrades = await Trade.findAndCountAll({
             order: [['status_updated', 'DESC']],
             offset: req.body.offset,
             limit: req.body.limit,
             include: {
                 model: User,
                 as: 'users2',
                 where: {
                     user_id: req.body.leaguemates
                 }
             },
             distinct: true
         })
   */
    } catch (error) {
        console.log(error)
    }


    res.send(lmLeaguesTrades)
}

exports.pricecheck = async (req, res) => {
    const pick_split = req.body.player_id.split(' ')
    const season = pick_split[0]
    const round = parseInt(pick_split[1]?.split('.')[0])
    const order = parseInt(pick_split[1]?.split('.')[1])

    let pcTrades;
    try {
        pcTrades = await Trade.findAll({
            where: {
                [Op.or]: [
                    {
                        adds: {
                            [req.body.player_id]: {
                                [Op.not]: null
                            }
                        }
                    },
                    {
                        draft_picks: {
                            [Op.contains]: [{
                                season: season,
                                round: round,
                                order: order
                            }]
                        }
                    }
                ]
            },
            include: {
                model: League,
                attributes: ['name', 'avatar', 'scoring_settings', 'roster_positions']
            }
        })
    } catch (error) {
        console.log(error)
    }

    const filteredTrades = [];
    for (const trade of pcTrades) {
        const dataValues = trade.dataValues;
        const query_pick = dataValues.draft_picks.find(
            (pick) =>
                pick.season === season &&
                pick.round === round &&
                (pick.order === order || !pick.order)
        );

        if (
            (Object.values(dataValues.adds).filter((x) => x === dataValues.adds[req.body.player_id]).length === 1 &&
                !dataValues.draft_picks.find((pick) => pick.new_user?.user_id === dataValues.adds[req.body.player_id])) ||
            (dataValues.draft_picks.filter((pick) => pick.new_user?.user_id === query_pick?.new_user?.user_id).length === 1 &&
                !Object.values(dataValues.adds).find((manager_user_id) => manager_user_id === query_pick?.new_user?.user_id))
        ) {
            filteredTrades.push(dataValues);
        }
    }

    res.send(filteredTrades);
}
