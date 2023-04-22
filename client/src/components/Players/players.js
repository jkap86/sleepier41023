import TableMain from "../Home/tableMain";
import { useState, useEffect } from "react";
import headshot from '../../images/headshot.png';
import PlayerLeagues from "./player_leagues";
import TeamFilter from "../Home/teamFilter";
import PositionFilter from "../Home/positionFilter";
import '../Home/css/modal.css';
import { getLocalDate } from '../Functions/dates';
import axios from 'axios';

const Players = ({
    stateAllPlayers,
    state_user,
    statePlayerShares,
    leagues_count
}) => {
    const [itemActive, setItemActive] = useState('');
    const [page, setPage] = useState(1)
    const [searched, setSearched] = useState('')
    const [filterPosition, setFilterPosition] = useState('W/R/T/Q')
    const [filterTeam, setFilterTeam] = useState('All')
    const [trendDateStart, setTrendDateStart] = useState()
    const [trendDateEnd, setTrendDateEnd] = useState()
    const [valueType, setValueType] = useState('SF')
    const [optionsVisible, setOptionsVisible] = useState(false)
    const [snapPercentage, setSnapPercentage] = useState(0)
    const [stateDynastyRankings, setStateDynastyRankings] = useState([])
    const [stateStats, setStateStats] = useState({})



    useEffect(() => {
        const fetchStats = async () => {
            const [stats, rankings] = await Promise.all([
                await axios.post('/dynastyrankings/stats', {
                    players: statePlayerShares.map(player => player.id),
                    date1: trendDateStart,
                    date2: trendDateEnd
                }),
                await axios.post('/dynastyrankings/find', {
                    players: statePlayerShares.map(player => player.id),
                    date1: trendDateStart,
                    date2: trendDateEnd
                })
            ])

            setStateDynastyRankings(rankings.data)

            setStateStats(stats.data)

        }
        if (statePlayerShares.length > 0 && trendDateStart && trendDateEnd) {
            fetchStats()
        }
    }, [statePlayerShares, trendDateStart, trendDateEnd])

    useEffect(() => {
        const today_eastern = new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]


        const thirty_days = new Date(new Date() - 30 * 24 * 60 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

        console.log(thirty_days)


        setTrendDateStart(thirty_days)
        setTrendDateEnd(today_eastern)

    }, [])
    const playerShares_headers = [
        [
            {
                text: 'Player',
                colSpan: 4,
                rowSpan: 2,
                className: 'half'
            },

            {
                text: 'Owned',
                colSpan: 2,
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
                    {`${trendDateStart} to ${trendDateEnd}`}
                    <i
                        className="fa-solid fa-filter fa-beat"
                        onClick={() => setOptionsVisible(prevState => !prevState)}
                    >

                    </i>
                </>,
                colSpan: 3,
                className: 'xsmall'
            }
        ],
        [
            {
                text: 'Total',
                colSpan: 1,
                className: 'half'
            },
            {
                text: '%',
                colSpan: 1,
                className: 'half'
            },
            {
                text: <span><p>KTC Value</p></span>,
                colSpan: 1,
                className: 'half small left'
            },
            {
                text: 'Trend',
                colSpan: 1,
                className: 'half small left'
            },
            {
                text: 'GP',
                colSpan: 1
            },
            {
                text: 'PPG',
                colSpan: 1
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
                    ?.find(dr => getLocalDate(dr.date) === getLocalDate(trendDateEnd))
                    ?.values[ktc_name]
                    ?.[valueType === 'SF' ? 'sf' : 'oneqb']

                prev_value = stateDynastyRankings
                    ?.find(dr => getLocalDate(dr.date) === getLocalDate(trendDateStart))
                    ?.values[ktc_name]
                    ?.[valueType === 'SF' ? 'sf' : 'oneqb']
            } else {


                cur_value = stateDynastyRankings
                    ?.find(dr => dr.date.toString() === trendDateEnd.toString())
                    ?.values[player.id]
                    ?.[valueType === 'SF' ? 'sf' : 'oneqb']

                prev_value = stateDynastyRankings
                    ?.find(dr => dr.date.toString() === trendDateStart.toString())
                    ?.values[player.id]
                    ?.[valueType === 'SF' ? 'sf' : 'oneqb']

            }

            const trend_games = stateStats?.[player.id]
                ?.filter(s => s.stats.tm_off_snp > 0 && ((s.stats.snp || s.stats.off_snp || 0) / (s.stats.tm_off_snp) > snapPercentage))


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
                        text: cur_value || '-',
                        colSpan: 1
                    },
                    {
                        text: (cur_value && prev_value && cur_value - prev_value) || '-',
                        colSpan: 1
                    },
                    {
                        text: trend_games?.length || '-',
                        colSpan: 1,
                        className: 'red'
                    },
                    {
                        text: trend_games?.length > 0 && (trend_games?.reduce((acc, cur) => acc + cur.stats.pts_ppr, 0) / trend_games?.length)?.toFixed(1) || '-',
                        colSpan: 1,
                        className: 'yellow'
                    }
                ],
                secondary_table: (
                    <PlayerLeagues
                        leagues_owned={player.leagues_owned}
                        leagues_taken={player.leagues_taken}
                        leagues_available={player.leagues_available}
                        stateStats={stateStats}
                        snapPercentage={snapPercentage}
                        player_id={player.id}
                        stateAllPlayers={stateAllPlayers}
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
        {
            optionsVisible ?
                <div className="modal">
                    <div className="modal-grid">
                        <button className="close" onClick={() => setOptionsVisible(false)}>Close</button>
                        <div className="modal-grid-item">
                            <div className="modal-grid-content header"><strong>Trend Range</strong>
                            </div>
                            <div className="modal-grid-content one">

                                <input type={'date'} defaultValue={trendDateStart} onBlur={(e) => e.target.value && setTrendDateStart(new Date(e.target.value).toISOString().split('T')[0])} />

                            </div>
                            <div className="modal-grid-content three">

                                <input type={'date'} defaultValue={trendDateEnd} onBlur={(e) => e.target.value && setTrendDateEnd(new Date(e.target.value).toISOString().split('T')[0])} />

                            </div>
                        </div>
                        <div className="modal-grid-item">
                            <div className="modal-grid-content header">
                                <strong>Game Filters</strong>
                            </div>
                        </div>
                        <div className="modal-grid-item">
                            <div className="modal-grid-content one">
                                <strong>Snap %</strong>
                            </div>
                            <div className="modal-grid-content two">
                                Min <input type={'number'} defaultValue={snapPercentage} onBlur={(e) => setSnapPercentage(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
                :
                null
        }

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