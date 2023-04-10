import { useState } from "react"
import TableMain from "../Home/tableMain"


const TradeTipRosters = ({
    userRoster,
    lmRoster,
    stateAllPlayers,
    league
}) => {
    const [filterUser, setFilterUser] = useState('All')
    const [filterLm, setFilterLm] = useState('All')

    console.log({
        userRoster: userRoster,
        lmRoster: lmRoster
    })
    const headers = (roster, setFilter) => {
        return [
            [
                {
                    text: roster.username,
                    colSpan: 17
                },
                {
                    text: <select onChange={(e) => setFilter(e.target.value)}>
                        <option>All</option>
                        <option>QB</option>
                        <option>RB</option>
                        <option>WR</option>
                        <option>TE</option>
                    </select>,
                    colSpan: 5
                }
            ],
            [
                {
                    text: 'Slot',
                    colSpan: 5
                },
                {
                    text: 'Player',
                    colSpan: 12,

                },
                {
                    text: 'Age',
                    colSpan: 5
                }
            ]
        ]
    }
    const position_abbrev = {
        'QB': 'QB',
        'RB': 'RB',
        'WR': 'WR',
        'TE': 'TE',
        'SUPER_FLEX': 'SF',
        'FLEX': 'WRT',
        'WRRB_FLEX': 'W R',
        'WRRB_WRT': 'W R',
        'REC_FLEX': 'W T'
    }


    const body = (roster, filter) => {
        let players;

        if (filter === 'All') {
            players = [...roster.starters, ...roster.players.filter(p => !roster.starters.includes(p))]
        } else {
            players = roster.players.filter(player_id => stateAllPlayers[player_id]?.position === filter)
        }


        return players?.map((player_id, index) => {
            return {
                id: player_id,
                list: [
                    {
                        text: filter === 'All' ? position_abbrev[league.roster_positions[index]] || league.roster_positions[index] : stateAllPlayers[player_id]?.position,
                        colSpan: 5
                    },

                    {
                        text: stateAllPlayers[player_id]?.full_name,
                        colSpan: 12,
                        className: 'left',
                        image: {
                            src: player_id,
                            alt: 'player headshot',
                            type: 'player'
                        }
                    },
                    {
                        text: stateAllPlayers[player_id]?.age,
                        colSpan: 5
                    }
                ]
            }
        })


    }

    return <>
        <TableMain
            type={'tertiary subs'}
            headers={headers(userRoster, setFilterUser)}
            body={body(userRoster, filterUser)}
        />
        <TableMain
            type={'tertiary subs'}
            headers={headers(lmRoster, setFilterLm)}
            body={body(lmRoster, filterLm)}
        />
    </>
}

export default TradeTipRosters;