'use strict'

module.exports = (sequelize, Sequelize, user_league) => {
    const League = sequelize.define("league", {
        league_id: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        avatar: {
            type: Sequelize.STRING
        },
        season: {
            type: Sequelize.STRING
        },
        settings: {
            type: Sequelize.JSONB
        },
        scoring_settings: {
            type: Sequelize.JSONB
        },
        roster_positions: {
            type: Sequelize.JSONB
        },
        rosters: {
            type: Sequelize.JSONB
        },
        drafts: {
            type: Sequelize.JSONB
        },
        ...Object.fromEntries(Array.from(Array(18).keys()).map(key => {
            return [`matchups_${key + 1}`, { type: Sequelize.JSONB }]
        }))
    }, {
        indexes: [
            {
                fields: ['league_id']
            }
        ],

        hooks: {
            afterBulkCreate: async (leagues, options) => {
                console.log(leagues.length)
                const users = []
                const userLeagueData = []
                const userLeaguemateData = []
                leagues.map(league => {
                    return (league.dataValues.rosters
                        ?.filter(r => r.user_id !== null && parseInt(r.user_id) > 0) || [])
                        .map(roster => {
                            userLeagueData.push({
                                userUserId: roster.user_id,
                                leagueLeagueId: league.dataValues.league_id
                            })

                            users.push({
                                user_id: roster.user_id,
                                username: roster.username,
                                avatar: roster.avatar,
                                type: 'LM',
                                updatedAt: new Date()
                            })

                            league.dataValues.rosters
                                .filter(r => parseInt(r.user_id) > 0 && r.user_id !== roster.user_id)
                                .map(lmRoster => {
                                    userLeaguemateData.push({
                                        userUserId: roster.user_id,
                                        leaguemateUserId: lmRoster.user_id
                                    })

                                    return
                                })
                        })
                })


                try {
                    await sequelize.model('user').bulkCreate(users, { ignoreDuplicates: true })

                    await sequelize.model('userLeagues').bulkCreate(userLeagueData, { ignoreDuplicates: true })
                } catch (error) {
                    console.log(error)
                }



                return
            }
        }
    });

    return League;
};
