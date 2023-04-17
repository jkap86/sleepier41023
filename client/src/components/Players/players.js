import TableMain from "../Home/tableMain";
import { useState, useEffect } from "react";
import headshot from '../../images/headshot.png';
import PlayerLeagues from "./player_leagues";
import TeamFilter from "../Home/teamFilter";
import PositionFilter from "../Home/positionFilter";

const Players = ({
    stateAllPlayers,
    state_user,
    statePlayerShares,
    leagues_count,
    stateDynastyRankings
}) => {
    const [itemActive, setItemActive] = useState('');
    const [page, setPage] = useState(1)
    const [searched, setSearched] = useState('')
    const [filterPosition, setFilterPosition] = useState('W/R/T/Q')
    const [filterTeam, setFilterTeam] = useState('All')
    const [trendDays, setTrendDays] = useState(30)
    const [valueType, setValueType] = useState('SF')

    console.log(stateDynastyRankings)

    const playerShares_headers = [
        [
            {
                text: 'Player',
                colSpan: 4,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: <select className="main_header" value={valueType} onChange={(e) => setValueType(e.target.value)}>
                    <option>SF</option>
                    <option>1QB</option>
                </select>,
                colSpan: 1,
                rowSpan: 1,
                className: 'half'
            },

            {
                text: <>
                    <input type={'number'} list={'options'} id='datalist' className={'main_header'} value={trendDays} onChange={(e) => setTrendDays(e.target.value)} />
                    <datalist id="options">
                        {
                            Array.from(Array(Math.max(0, stateDynastyRankings.length - 1)).keys()).map(key => {
                                return <option key={key + 1}>{key + 1}</option>
                            })
                        }
                    </datalist>
                </>,
                colSpan: 1,
                rowSpan: 1,
                className: 'half input'
            },
            {
                text: 'Owned',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Taken',
                colSpan: 1,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: 'Available',
                colSpan: 1,
                rowSpan: 2,
                className: 'half'
            }
        ],
        [
            {
                text: <span><p>KTC Value</p></span>,
                colSpan: 1,
                className: 'half small left'
            },
            {
                text: <span><p>Day Trend</p></span>,
                colSpan: 1,
                className: 'half small left'
            },
            {
                text: 'Total',
                colSpan: 1,
                className: 'half'
            },
            {
                text: '%',
                colSpan: 1,
                className: 'half'
            }
        ]
    ]

    const playerShares_body = statePlayerShares
        .filter(x =>
            (
                x.id.includes('_') || stateAllPlayers[x.id])
            && (
                filterPosition === stateAllPlayers[x.id]?.position
                || filterPosition.split('/').includes(stateAllPlayers[x.id]?.position?.slice(0, 1))
                || (
                    filterPosition === 'Picks' && x.id.includes('_')
                )
            ) && (
                filterTeam === 'All' || stateAllPlayers[x.id]?.team === filterTeam
            )
        )
        .sort((a, b) => b.leagues_owned.length - a.leagues_owned.length)
        .map(player => {
            let pick_name;
            let ktc_name;
            let cur_value;
            let prev_value;
            if (player.id.includes('_')) {
                const pick_split = player.id.split('_')
                pick_name = `${pick_split[0]} ${pick_split[1]}.${pick_split[2].toLocaleString("en-US", { minimumIntegerDigits: 2 })}`
                ktc_name = `${pick_split[0]} ${parseInt(pick_split[2]) <= 4 ? 'Early' : parseInt(pick_split[2]) >= 9 ? 'Late' : 'Mid'} ${pick_split[1]}`

                cur_value = stateDynastyRankings
                    ?.find(x => x.date === new Date(new Date().getTime() - (new Date().getTimezoneOffset() + 240) * 60000).toISOString().split('T')[0])
                    ?.values[ktc_name]?.[valueType === 'SF' ? 'sf' : 'oneqb']

                prev_value = stateDynastyRankings
                    ?.find(x => x.date === new Date((new Date().getTime() - (new Date().getTimezoneOffset() + 240) * 60000) - trendDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                    ?.values[ktc_name]?.[valueType === 'SF' ? 'sf' : 'oneqb']
            } else {

                cur_value = stateDynastyRankings
                    ?.find(x => x.date === new Date(new Date().getTime() - (new Date().getTimezoneOffset() + 240) * 60000).toISOString().split('T')[0])
                    ?.values[player.id]?.[valueType === 'SF' ? 'sf' : 'oneqb']


                prev_value = stateDynastyRankings
                    ?.find(x => x.date === new Date((new Date().getTime() - (new Date().getTimezoneOffset() + 240) * 60000) - trendDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                    ?.values[player.id]?.[valueType === 'SF' ? 'sf' : 'oneqb']
            }


            return {
                id: player.id,
                search: {
                    text: stateAllPlayers[player.id] && `${stateAllPlayers[player.id]?.full_name} ${stateAllPlayers[player.id]?.position} ${stateAllPlayers[player.id]?.team || 'FA'}` || pick_name,
                    image: {
                        src: player.id,
                        alt: 'player photo',
                        type: 'player'
                    }
                },
                list: [
                    {
                        text: player.id.includes('_') ? pick_name : `${stateAllPlayers[player.id]?.position} ${stateAllPlayers[player.id]?.full_name} ${player.id.includes('_') ? '' : stateAllPlayers[player.id]?.team || 'FA'}` || `INACTIVE PLAYER`,
                        colSpan: 4,
                        className: 'left',
                        image: {
                            src: stateAllPlayers[player.id] ? player.id : headshot,
                            alt: stateAllPlayers[player.id]?.full_name || player.id,
                            type: 'player'
                        }
                    },
                    {
                        text: cur_value || '-',
                        colSpan: 1
                    },
                    {
                        text: (cur_value - prev_value > 0 ? '+' : '') + (cur_value && prev_value && cur_value - prev_value || '-'),
                        colSpan: 1
                    },
                    {
                        text: player.leagues_owned.length.toString(),
                        colSpan: 1,
                        className: 'green'
                    },
                    {
                        text: ((player.leagues_owned.length / leagues_count) * 100).toFixed(1) + '%',
                        colSpan: 1,
                        className: 'green'
                    },
                    {
                        text: player.leagues_taken.length.toString(),
                        colSpan: 1,
                        className: 'red'
                    },
                    {
                        text: player.id.includes('_') ? '-' : player.leagues_available?.length || '0',
                        colSpan: 1,
                        className: 'yellow'
                    }
                ],
                secondary_table: (
                    <PlayerLeagues
                        leagues_owned={player.leagues_owned}
                        leagues_taken={player.leagues_taken}
                        leagues_available={player.leagues_available}
                    />
                )
            }
        })

    useEffect(() => {
        if (filterPosition === 'Picks') {
            setFilterTeam('All')
        }
    }, [filterPosition])

    const teamFilter = <TeamFilter
        filterTeam={filterTeam}
        setFilterTeam={setFilterTeam}
        picks={true}
    />

    const positionFilter = <PositionFilter
        filterPosition={filterPosition}
        setFilterPosition={setFilterPosition}
        picks={true}
    />

    return <>

        <TableMain
            id={'Players'}
            type={'main'}
            headers={playerShares_headers}
            body={playerShares_body}
            page={page}
            setPage={setPage}
            itemActive={itemActive}
            setItemActive={setItemActive}
            search={true}
            searched={searched}
            setSearched={setSearched}
            options1={[teamFilter]}
            options2={[positionFilter]}
        />
    </>
}

export default Players;