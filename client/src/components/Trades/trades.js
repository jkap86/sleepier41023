import axios from 'axios';
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getTradeTips } from '../Functions/getTradeTips';
import TableMain from '../Home/tableMain';
import { loadingIcon } from '../Functions/misc';
import TradeInfo from './tradeInfo';
import Search from '../Home/search';
import { avatar } from '../Functions/misc';

const Trades = ({
    stateAllPlayers,
    stateState,
    state_user,
    stateLmTrades,
    setStateLmTrades,
    stateLmLeaguesTrades,
    statePriceCheckTrades,
    setStatePriceCheckTrades,
    stateLeaguematesDict,
    stateLeagues,
    isLoadingTrades,
    setIsLoadingTrades
}) => {
    const params = useParams();

    const [tab, setTab] = useState('Leaguemate Trades');
    const [page, setPage] = useState(1);
    const [itemActive, setItemActive] = useState('');
    const [searched_player, setSearched_Player] = useState('')
    const [searched_league, setSearched_League] = useState('')
    const [searched_manager, setSearched_Manager] = useState('')
    const [pricecheck_player, setPricecheck_player] = useState('')
    const [pricecheck_player2, setPricecheck_player2] = useState('')
    const [stateDynastyRankings, setStateDynastyRankings] = useState([])
    const [filterType, setFilterType] = useState('Player')


    let tradesDisplay;
    let tradeCount;


    useEffect(() => {
        const players = Array.from(new Set(tradesDisplay.map(trade => Object.keys(trade.adds)).flat()))
        const dates = tradesDisplay.map(trade => trade.status_updated)

        const start = Math.min(...dates)
        const end = Math.max(...dates)
        const fetchStats = async () => {
            const rankings = await axios.post('/dynastyrankings/find', {
                players: players,
                date1: start,
                date2: end
            })

            setStateDynastyRankings(rankings.data)



        }
        if (tradesDisplay) {
            fetchStats()
        }

    }, [tradesDisplay])

    useEffect(() => {
        setStateLmTrades({ ...stateLmTrades })
    }, [isLoadingTrades])

    useEffect(() => {
        setSearched_Player('')
        setSearched_Manager('')
        setSearched_League('')
    }, [tab, filterType])

    useEffect(() => {
        setPage(1)
    }, [searched_player, searched_league, searched_manager, pricecheck_player, pricecheck_player2, tab])

    useEffect(() => {
        const fetchFilteredTrades = async () => {
            setIsLoadingTrades(true)

            let searches = stateLmTrades.searches || []

            if (!searches.find(s => s.player === searched_player.id && s.manager === searched_manager.id)) {
                const trades = await axios.post('/trade/leaguemate', {
                    user_id: state_user.user_id,
                    leaguemates: Object.keys(stateLeaguematesDict),
                    player: searched_player.id,
                    manager: searched_manager.id,
                    offset: 0,
                    limit: 125
                })

                setStateLmTrades({
                    ...stateLmTrades,
                    searches: [
                        ...searches,
                        {
                            player: searched_player.id,
                            manager: searched_manager.id,
                            trades: getTradeTips(trades.data.rows, stateLeagues, stateLeaguematesDict, stateState.league_season),
                            count: trades.data.count
                        }
                    ]
                })
            }


            setIsLoadingTrades(false)
        }
        if (searched_player !== '' || searched_manager !== '') {
            fetchFilteredTrades()
        }
    }, [searched_player, searched_manager])

    useEffect(() => {
        const fetchPriceCheckTrades = async () => {

            let pcTrades = statePriceCheckTrades

            if (!pcTrades.find(pcTrade => pcTrade.player === pricecheck_player.id && pcTrade.player2 === pricecheck_player2.id)) {
                setIsLoadingTrades(true)

                const player_trades = await axios.post('/trade/pricecheck', {
                    player: pricecheck_player.id,
                    player2: pricecheck_player2.id,
                    offset: 0,
                    limit: 125
                })
                console.log({ pcTrades: player_trades.data })

                setStatePriceCheckTrades([
                    ...pcTrades,
                    {
                        player: pricecheck_player.id,
                        player2: pricecheck_player2.id,
                        trades: getTradeTips(player_trades.data.rows, stateLeagues, stateLeaguematesDict, stateState.league_season),
                        count: player_trades.data.count
                    }
                ])

                setIsLoadingTrades(false)
            }
        }
        if (pricecheck_player !== '') {
            fetchPriceCheckTrades()
        }
    }, [pricecheck_player, pricecheck_player2])

    const trades_headers = [
        [
            {
                text: 'Date',
                colSpan: 3
            },
            {
                text: 'League',
                colSpan: 7
            }
        ]
    ]


    switch (tab) {
        case 'Leaguemate Trades':

            if (searched_player === '' && searched_league === '' && searched_manager === '') {
                tradesDisplay = stateLmTrades.trades || []
                tradeCount = stateLmTrades.count
            } else {
                let search_trades = stateLmTrades.searches?.find(s => s.player === searched_player.id && s.manager === searched_manager.id)

                tradesDisplay = search_trades?.trades || []
                tradeCount = search_trades?.count
                /*
                                tradesDisplay = stateLmTrades.searches?.player?.find(s => s.id === searched_player.id)?.results
                                    ?.filter(trade => searched_manager === '' || trade.managers.includes(searched_manager.id))
                                    ||
                                    stateLmTrades.searches?.manager?.find(s => s.id === searched_manager.id)?.results
                                        ?.filter(trade => searched_player === '' || Object.keys(trade.adds).includes(searched_player.id))
                                    ||
                                    []
                
                                tradeCount = tradesDisplay?.length
                */
            }
            break;
        case 'Leaguemate Leagues Trades':
            if (searched_player === '' && searched_league === '' && searched_manager === '') {
                tradesDisplay = stateLmLeaguesTrades.trades || []
                tradeCount = stateLmLeaguesTrades.count
            } else {
                if (filterType === 'Player') {
                    const searches = stateLmLeaguesTrades.searches?.player
                    tradesDisplay = (searches?.find(s => s.id === searched_player.id)?.results || [])
                        .filter(trade => searched_manager === '' || trade.managers.includes(searched_manager.id))
                    tradeCount = tradesDisplay?.length
                } else if (filterType === 'Manager') {
                    const searches = stateLmLeaguesTrades.searches?.manager
                    tradesDisplay = (searches?.find(s => s.id === searched_manager.id)?.results || [])
                        .filter(trade => searched_player === '' || Object.keys(trade.adds).includes(searched_player.id))
                    tradeCount = tradesDisplay?.length
                }
            }
            break;
        case 'Price Check':
            const pcTrades = statePriceCheckTrades.find(pcTrade => pcTrade.player === pricecheck_player.id && pcTrade.player2 === pricecheck_player2.id)

            tradesDisplay = pcTrades?.trades || []
            tradeCount = pcTrades?.count

            break;
        default:
            break;
    }

    const eastern_time = new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]


    const trades_body = tradesDisplay
        ?.sort((a, b) => parseInt(b.status_updated) - parseInt(a.status_updated))
        ?.map(trade => {
            return {
                id: trade.transaction_id,
                list: [

                    {
                        text: <TableMain
                            type={'trade_summary'}
                            headers={[]}
                            body={
                                [
                                    {
                                        id: 'title',
                                        list: [
                                            {
                                                text: new Date(parseInt(trade.status_updated)).toLocaleDateString('en-US') + ' ' + new Date(parseInt(trade.status_updated)).toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" }),
                                                colSpan: 3,
                                                className: 'small'
                                            },
                                            {
                                                text: trade['league.name'],
                                                colSpan: 7,

                                                image: {
                                                    src: trade.league?.avatar,
                                                    alt: 'league avatar',
                                                    type: 'league'
                                                }
                                            },
                                        ]
                                    },
                                    ...trade.managers.map(rid => {
                                        const roster = trade.rosters?.find(r => r.user_id === rid)

                                        const cur_values = stateDynastyRankings
                                            .find(x => x.date === new Date(eastern_time).toISOString().split('T')[0])?.values || {}



                                        const trans_values = stateDynastyRankings
                                            .find(x => x.date === new Date(parseInt(trade.status_updated) - new Date(parseInt(trade.status_updated)).getTimezoneOffset() * 60000).toISOString().split('T')[0])?.values


                                        const superflex = trade['league.roster_positions'].filter(p => p === 'QB' || p === 'SUPER_FLEX').length > 1 ? true : false
                                        const trans_value = Object.keys(trade.adds || {}).filter(a => trade.adds[a] === roster?.user_id)
                                            .reduce((acc, cur) =>
                                                acc + parseInt(trans_values?.[cur]?.[superflex ? 'sf' : 'oneqb'] || 0)
                                                , 0)
                                            +
                                            trade.draft_picks.filter(p => p.owner_id === roster?.roster_id)
                                                .reduce((acc, cur) =>
                                                    acc + (trans_values && parseInt(trans_values?.[
                                                        `${cur.season} ${`${cur.order <= 4 ? 'Early' : cur.order >= 9 ? 'Late' : 'Mid'}`} ${cur.round}`
                                                    ]?.[superflex ? 'sf' : 'oneqb'] || 0)) || 0
                                                    , 0)




                                        const cur_value = Object.keys(trade.adds || {}).filter(a => trade.adds[a] === roster?.user_id)
                                            .reduce((acc, cur) => acc + parseInt(cur_values?.[cur]?.[superflex ? 'sf' : 'oneqb'] || 0), 0)
                                            +
                                            trade.draft_picks.filter(p => p.owner_id === roster?.roster_id)
                                                .reduce((acc, cur) =>
                                                    acc + (cur_values && parseInt(cur_values[
                                                        `${cur.season} ${`${cur.order <= 4 ? 'Early' : cur.order >= 9 ? 'Late' : 'Mid'}`} ${cur.round}`
                                                    ]?.[superflex ? 'sf' : 'oneqb'] || 0)) || 0
                                                    , 0)

                                        const number = Object.keys(trade.adds || {}).filter(a => trade.adds[a] === roster?.user_id).length
                                            + trade.draft_picks.filter(p => p.owner_id === roster?.roster_id).length
                                        return {
                                            id: trade.transaction_id,
                                            list: [

                                                {
                                                    text: <div className='trade_manager'>
                                                        <div>
                                                            <p className='value'>
                                                                KTC:
                                                                {
                                                                    trans_value.toLocaleString("en-US")
                                                                }
                                                            </p>
                                                            <p className='trend'>
                                                                {
                                                                    cur_value - trans_value >= 0 ? '+' : ''
                                                                }
                                                                {
                                                                    (cur_value - trans_value).toString()
                                                                }

                                                            </p>
                                                        </div>
                                                        <p>
                                                            {
                                                                avatar(
                                                                    roster?.avatar, 'user avatar', 'user'
                                                                )
                                                            }
                                                            <span>{roster?.username || 'Orphan'}</span>
                                                        </p>
                                                    </div>,
                                                    colSpan: 3,
                                                    className: 'left trade_manager'
                                                },
                                                {
                                                    text: <table className='trade_info'>
                                                        <tbody>
                                                            {
                                                                Object.keys(trade.adds || {}).filter(a => trade.adds[a] === roster?.user_id).map(player_id =>
                                                                    <tr
                                                                        className={
                                                                            `${trade.tips?.trade_away && trade.tips?.trade_away?.find(p => p.player_id === player_id)?.manager.user_id === rid

                                                                                ? 'red'
                                                                                : ''
                                                                            }`
                                                                        }

                                                                    >
                                                                        <td colSpan={4} className='left'><p><span>+ {stateAllPlayers[player_id]?.full_name}</span></p></td>
                                                                        <td className='value'>
                                                                            {trans_values?.[player_id]?.[superflex ? 'sf' : 'oneqb'] || '-'}
                                                                        </td>
                                                                        <td className='value'>
                                                                            {
                                                                                cur_values?.[player_id]?.[superflex ? 'sf' : 'oneqb'] - trans_values?.[player_id]?.[superflex ? 'sf' : 'oneqb'] > 0 ? '+' : ''
                                                                            }
                                                                            {cur_values?.[player_id] && trans_values?.[player_id] && (cur_values?.[player_id]?.[superflex ? 'sf' : 'oneqb'] - trans_values?.[player_id]?.[superflex ? 'sf' : 'oneqb']).toString() || ''}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            }
                                                            {
                                                                trade.draft_picks
                                                                    .filter(p => p.owner_id === roster?.roster_id)
                                                                    .sort((a, b) => (a.season) - b.season || a.round - b.round)
                                                                    .map(pick => {
                                                                        const ktc_name = `${pick.season} ${pick.order <= 4 ? 'Early' : pick.order >= 9 ? 'Late' : 'Mid'} ${pick.round}`
                                                                        return <tr>
                                                                            <td
                                                                                colSpan={4}
                                                                                className={`${trade.tips?.trade_away && trade.tips?.trade_away
                                                                                    ?.find(p =>
                                                                                        p?.player_id?.season === pick.season
                                                                                        && p?.player_id?.round === pick.round
                                                                                        && p?.player_id?.order === pick.order
                                                                                    )?.manager?.user_id === rid ? 'red left' : 'left'}`}
                                                                            >
                                                                                {
                                                                                    <p><span>{`+ ${pick.season} Round ${pick.round}${pick.order && pick.season === stateState.league_season ? `.${pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : ` (${pick.original_user?.username || 'Orphan'})`}`}</span></p>
                                                                                }
                                                                            </td>
                                                                            <td className='value'>
                                                                                {
                                                                                    trans_values?.[ktc_name]?.[superflex ? 'sf' : 'oneqb'] || '-'
                                                                                }
                                                                            </td>
                                                                            <td className='value'>
                                                                                {
                                                                                    cur_values?.[ktc_name]?.[superflex ? 'sf' : 'oneqb'] - trans_values?.[ktc_name]?.[superflex ? 'sf' : 'oneqb'] > 0 ? '+' : ''
                                                                                }
                                                                                {cur_values?.[ktc_name] && trans_values?.[ktc_name] && ((cur_values?.[ktc_name]?.[superflex ? 'sf' : 'oneqb'] - trans_values?.[ktc_name]?.[superflex ? 'sf' : 'oneqb'])).toString() || '-'}
                                                                            </td>
                                                                        </tr>
                                                                    })
                                                            }
                                                        </tbody>
                                                    </table>,
                                                    colSpan: 4,
                                                    rowSpan: 2,
                                                    className: 'small'
                                                },
                                                {
                                                    text: <table className='trade_info'>
                                                        <tbody>
                                                            {
                                                                Object.keys(trade.drops || {}).filter(d => trade.drops[d] === roster?.user_id).map(player_id =>

                                                                    <tr
                                                                        className={
                                                                            `${trade.tips?.acquire && trade.tips?.acquire?.find(p => p.player_id === player_id)?.manager?.user_id === rid
                                                                                ? 'green'
                                                                                : ''
                                                                            }`
                                                                        }
                                                                    >
                                                                        <td className='left end' colSpan={4}>

                                                                            <p>
                                                                                <span className='end'>
                                                                                    {
                                                                                        (`- ${stateAllPlayers[player_id]?.full_name}`).toString()
                                                                                    }
                                                                                </span>
                                                                            </p>

                                                                        </td>
                                                                    </tr>

                                                                )
                                                            }
                                                            {
                                                                trade.draft_picks
                                                                    .filter(p => p.previous_owner_id === roster?.roster_id)
                                                                    .sort((a, b) => (a.season) - b.season || a.round - b.round)
                                                                    .map(pick =>
                                                                        <tr>
                                                                            <td colSpan={4} className={`end ${trade.tips?.acquire && trade.tips?.acquire
                                                                                ?.find(p =>
                                                                                    p?.player_id?.season === pick.season
                                                                                    && p?.player_id?.round === pick.round
                                                                                    && p?.player_id?.order === pick.order
                                                                                )?.manager?.user_id === rid ? 'green left' : 'left'}`}>
                                                                                <p>
                                                                                    <span className="end">
                                                                                        {
                                                                                            (`- ${pick.season} Round ${pick.round}${pick.order && pick.season === stateState.league_season ? `.${pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : ` (${pick.original_user?.username || 'Orphan'})`}`).toString()
                                                                                        }
                                                                                    </span>
                                                                                </p>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                            }
                                                        </tbody>
                                                    </table>,
                                                    colSpan: 3,
                                                    rowSpan: 2,
                                                    className: 'small'
                                                }
                                            ],
                                            secondary_table: (
                                                <TradeInfo
                                                    trade={trade}
                                                    stateAllPlayers={stateAllPlayers}
                                                    stateState={stateState}
                                                    state_user={state_user}
                                                    stateDynastyRankings={stateDynastyRankings}
                                                />
                                            )
                                        }
                                    })

                                ]
                            }
                        />,
                        colSpan: 10,
                        className: `small `
                    }

                ],
                secondary_table: (
                    <TradeInfo
                        trade={trade}
                        stateAllPlayers={stateAllPlayers}
                        stateState={stateState}
                        state_user={state_user}
                    />
                )
            }
        }) || []



    let managers_list = Object.keys(stateLeaguematesDict).map(user_id => {
        return {
            id: user_id,
            text: stateLeaguematesDict[user_id].username,
            image: {
                src: stateLeaguematesDict[user_id].avatar,
                alt: 'user avatar',
                type: 'user'
            }
        }
    })

    const managers_list2 = Object.keys(stateLeaguematesDict)
        .filter(lm => tradesDisplay?.find(trade => trade.managers.includes(lm)))
        .map(user_id => {
            return {
                id: user_id,
                text: stateLeaguematesDict[user_id].username,
                image: {
                    src: stateLeaguematesDict[user_id].avatar,
                    alt: 'user avatar',
                    type: 'user'
                }
            }
        })



    const picks_list = []

    Array.from(Array(4).keys()).map(season => {
        return Array.from(Array(5).keys()).map(round => {
            if (season !== 0) {
                return picks_list.push({
                    id: `${season + parseInt(stateState.league_season)} ${round + 1}.${null}`,
                    text: `${season + parseInt(stateState.league_season)}  Round ${round + 1}`,
                    image: {
                        src: null,
                        alt: 'pick headshot',
                        type: 'player'
                    }
                })
            } else {
                return Array.from(Array(12).keys()).map(order => {
                    return picks_list.push({
                        id: `${season + parseInt(stateState.league_season)} ${round + 1}.${season === 0 ? (order + 1).toLocaleString("en-US", { minimumIntegerDigits: 2 }) : null}`,
                        text: `${season + parseInt(stateState.league_season)} ${season === 0 ? `${round + 1}.${(order + 1).toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : ` Round ${round + 1}`}`,
                        image: {
                            src: null,
                            alt: 'pick headshot',
                            type: 'player'
                        }
                    })
                })
            }
        })
    })


    const players_list = [
        ...Array.from(
            new Set(
                stateLeagues.map(league => league.rosters?.map(roster => roster.players)).flat(3)
            )
        ).map(player_id => {
            return {
                id: player_id,
                text: stateAllPlayers[player_id]?.full_name,
                image: {
                    src: player_id,
                    alt: 'player headshot',
                    type: 'player'
                }
            }
        }),
        ...picks_list
    ]

    const picks_list2 = picks_list
        .filter(draft_pick =>
            tradesDisplay?.find(trade =>
                trade.draft_picks.find(pick =>
                    draft_pick.id === `${pick.season} ${pick.round}.${pick.season === stateState.league_season && pick.order ? (pick.order).toLocaleString("en-US", { minimumIntegerDigits: 2 }) : null}`
                )
            )
        )
        .map(pick => {
            return {
                id: pick.id,
                text: pick.text,
                image: {
                    src: null,
                    alt: 'pick headshot',
                    type: 'player'
                }
            }
        })


    const players_list2 = [
        ...Object.keys(stateAllPlayers)
            .filter(player_id => tradesDisplay?.find(trade => Object.keys(trade.adds).includes(player_id)))
            .map(player_id => {
                return {
                    id: player_id,
                    text: stateAllPlayers[player_id].full_name,
                    image: {
                        src: player_id,
                        alt: 'player headshot',
                        type: 'player'
                    }
                }
            }),
        ...picks_list2
    ]

    let searchBar;

    switch (tab) {
        case 'Leaguemate Trades':
            searchBar = (
                <>
                    <Search
                        id={'By Player'}
                        sendSearched={(data) => setSearched_Player(data)}
                        placeholder={`Player`}
                        list={players_list}
                        tab={tab}
                    />
                    <Search
                        id={'By Manager'}
                        sendSearched={(data) => setSearched_Manager(data)}
                        placeholder={`Manager`}
                        list={managers_list}
                        tab={tab}
                    />




                </>
            )
            break;
        case 'Leaguemate Leagues Trades':
            searchBar = <Search
                id={'By Manager'}
                sendSearched={(data) => setSearched_Manager(data)}
                placeholder={`Leaguemate`}
                list={managers_list}
                tab={tab}
            />
            break;
        case 'Price Check':
            searchBar = (
                <>
                    <Search
                        id={'By Player'}
                        sendSearched={(data) => setPricecheck_player(data)}
                        placeholder={`Player`}
                        list={players_list}
                        tab={tab}
                    />
                    {
                        pricecheck_player === '' ? null :
                            <>
                                <Search
                                    id={'By Player'}
                                    sendSearched={(data) => setPricecheck_player2(data)}
                                    placeholder={`Player`}
                                    list={players_list}
                                    tab={tab}
                                />
                            </>
                    }
                </>
            )

            break;
        default:
            break;

    }

    const loadMore = async () => {
        setIsLoadingTrades(true)
        if (tab === 'Leaguemate Trades') {
            if (searched_player === '' && searched_manager === '') {
                let trades = stateLmTrades.trades;
                let tradesMore = await axios.post('/trade/leaguemate', {
                    user_id: state_user.user_id,
                    leaguemates: Object.keys(stateLeaguematesDict),
                    offset: trades.length,
                    limit: 125
                })

                setPage(Math.ceil(stateLmTrades.trades.length / 25) + 1)
                setStateLmTrades({
                    ...stateLmTrades,
                    trades: [...stateLmTrades.trades, ...getTradeTips(tradesMore.data.rows, stateLeagues, stateLeaguematesDict, stateState.league_season)]
                })
            } else {
                let trades = stateLmTrades.searches.find(s => s.player === searched_player.id && s.manager === searched_manager.id)?.trades || []
                let tradesMore = await axios.post('/trade/leaguemate', {
                    user_id: state_user.user_id,
                    leaguemates: Object.keys(stateLeaguematesDict),
                    player: searched_player.id,
                    manager: searched_manager.id,
                    offset: trades.length,
                    limit: 125
                })

                setPage(Math.ceil(trades.length / 25) + 1)
                setStateLmTrades({
                    ...stateLmTrades,
                    searches: [
                        ...stateLmTrades.searches.filter(s => !(s.player === searched_player.id && s.manager === searched_manager.id)),
                        {
                            player: searched_player.id,
                            manager: searched_manager.id,
                            trades: [...trades, ...getTradeTips(tradesMore.data.rows, stateLeagues, stateLeaguematesDict, stateState.league_season)],
                            count: tradesMore.data.count
                        }
                    ]
                })
            }
        } else if (tab === 'Price Check') {
            let trades = statePriceCheckTrades.find(pcTrade => pcTrade.player === pricecheck_player.id && pcTrade.player2 === pricecheck_player2.id)?.trades || []
            let tradesMore = await axios.post('/trade/pricecheck', {
                player: pricecheck_player.id,
                player2: pricecheck_player2.id,
                offset: trades.length,
                limit: 125
            })

            setPage(Math.ceil(trades.length / 25) + 1)
            setStatePriceCheckTrades([
                ...statePriceCheckTrades.filter(pcTrade => pcTrade.player === pricecheck_player.id && pcTrade.player2 === pricecheck_player2.id),
                {
                    player: pricecheck_player.id,
                    player2: pricecheck_player2.id,
                    trades: [...trades, ...getTradeTips(tradesMore.data.rows, stateLeagues, stateLeaguematesDict, stateState.league_season)],
                    count: tradesMore.data.count
                }
            ])
        }
        setIsLoadingTrades(false)
    }

    return <>
        <h2>
            {tradeCount?.toLocaleString("en-US")}
            {` ${stateState.league_season} Trades`}

        </h2>
        <div className='navbar'>
            <p className='select'>
                {tab}&nbsp;<i class="fa-solid fa-caret-down"></i>
            </p>

            <select
                className='trades'
                onChange={(e) => setTab(e.target.value)}
                value={tab}
                disabled={isLoadingTrades}
            >
                <option>Price Check </option>
                <option>Leaguemate Trades</option>
            </select>
        </div>
        <div className="trade_search_wrapper">

            {searchBar}
        </div>
        {
            isLoadingTrades ?
                <div className='loading_wrapper'>
                    {loadingIcon}
                </div>
                :
                <TableMain
                    id={'trades'}
                    type={'main'}
                    headers={trades_headers}
                    body={trades_body}
                    itemActive={itemActive}
                    setItemActive={setItemActive}
                    page={page}
                    setPage={setPage}
                    partial={tradesDisplay?.length < tradeCount ? true : false}
                    loadMore={loadMore}
                    isLoading={isLoadingTrades}
                />
        }
    </>
}

export default Trades;