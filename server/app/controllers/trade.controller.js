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

            include: [
                {
                    model: League,
                    //attributes: ['name', 'avatar']
                }
            ]
        })






    } catch (error) {
        console.log(error)
    }




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
            },
            include: League
        })
    } catch (error) {
        console.log(error)
    }

    res.send(
        pcTrades
            .map(trade => trade.dataValues)
            .filter(trade => {
                const query_pick = trade.draft_picks.find(
                    pick => pick.season === season
                        && pick.round === round
                        && (pick.order === order || !pick.order)
                )
                return (
                    Object.values(trade.adds).filter(x => x === trade.adds[req.body.player_id]).length === 1
                    && !trade.draft_picks.find(pick => pick.new_user?.user_id === trade.adds[req.body.player_id])
                ) || (
                        trade.draft_picks.filter(pick => pick.new_user?.user_id === query_pick?.new_user?.user_id).length === 1
                        && !Object.values(trade.adds).find(manager_user_id => manager_user_id === query_pick?.new_user?.user_id)
                    )
            })
    )
}
