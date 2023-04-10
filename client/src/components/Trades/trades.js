import axios from 'axios';
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getTradeTips } from '../Functions/getTradeTips';
import TableMain from '../Home/tableMain';
import { loadingIcon } from '../Functions/misc';
import TradeInfo from './tradeInfo';
import Search from '../Home/search';

const Trades = ({
    stateAllPlayers,
    stateState,
    state_user,
    stateLmTrades,
    setStateLmTrades,
    stateLmLeaguesTrades,
    setStateLmLeaguesTrades,
    statePriceCheckTrades,
    setStatePriceCheckTrades,
    stateLeaguematesDict,
    stateLeagues
}) => {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState('Price Check');
    const [page, setPage] = useState(1);
    const [itemActive, setItemActive] = useState('');
    const [searched_player, setSearched_Player] = useState('')
    const [searched_league, setSearched_League] = useState('')
    const [searched_manager, setSearched_Manager] = useState('')
    const [pricecheck_player, setPricecheck_player] = useState('')

    const [filterType, setFilterType] = useState('Player')

    console.log(stateLmTrades)

    useEffect(() => {
        const fetchTrades = async () => {
            setIsLoading(true)


            let trades = stateLmTrades.trades;

            if (!trades) {
                trades = await axios.post('/trade/leaguemate', {
                    user_id: state_user.user_id,
                    leaguemates: Object.keys(stateLeaguematesDict),
                    offset: stateLmTrades.length,
                    limit: 125
                })


                setStateLmTrades({
                    ...stateLmTrades,
                    count: trades.data.count,
                    trades: getTradeTips(trades.data.rows, stateLeagues, stateLeaguematesDict, stateState.league_season)
                })


            } else {
                setStateLmTrades({ ...stateLmTrades })
            }


            setIsLoading(false)
        }

        if (tab === 'Leaguemate Trades') {
            fetchTrades()
        }
    }, [state_user, stateLeaguematesDict, tab])

    useEffect(() => {
        setSearched_Player('')
        setSearched_Manager('')
        setSearched_League('')
    }, [tab, filterType])

    useEffect(() => {
        setPage(1)
    }, [searched_player, searched_league, searched_manager, tab])

    useEffect(() => {
        const fetchFilteredTrades = async () => {
            setIsLoading(true)
            let searches;
            if (searched_manager === '') {
                searches = stateLmTrades.searches?.player || []
                if (!searches?.find(s => s.id === searched_player.id)) {
                    const trades = await axios.post('/trade/leaguemate', {
                        user_id: state_user.user_id,
                        leaguemates: Object.keys(stateLeaguematesDict),
                        player: searched_player.id
                    })

                    setStateLmTrades({
                        ...stateLmTrades,
                        searches: {
                            player: [...searches, {
                                id: searched_player.id,
                                results: getTradeTips(trades.data.rows, stateLeagues, stateLeaguematesDict, stateState.league_season)
                            }]
                        }
                    })

                }
            } else {
                tradesDisplay.filter(t => t.managers.includes(searched_manager.id))
            }
            setIsLoading(false)
        }
        if (searched_player !== '' && tab === 'Leaguemate Trades') {
            fetchFilteredTrades()
        }
    }, [searched_player])

    useEffect(() => {
        const fetchFilteredTrades = async () => {
            setIsLoading(true)
            let searches;
            if (searched_player === '') {
                searches = stateLmTrades.searches?.manager || []
                if (!searches?.find(s => s.id === searched_manager.id)) {
                    const trades = await axios.post('/trade/leaguemate', {
                        user_id: state_user.user_id,
                        manager: searched_manager.id
                    })
                    console.log(trades.data)
                    setStateLmTrades({
                        ...stateLmTrades,
                        searches: {
                            manager: [...searches, {
                                id: searched_manager.id,
                                results: getTradeTips(trades.data.rows, stateLeagues, stateLeaguematesDict, stateState.league_season)
                            }]
                        }
                    })
                }
            }

            setIsLoading(false)
        }
        if (searched_manager !== '' && tab === 'Leaguemate Trades') {
            fetchFilteredTrades()
        }
    }, [searched_manager])

    useEffect(() => {
        const fetchPriceCheckTrades = async () => {

            let pcTrades = statePriceCheckTrades

            if (!pcTrades[pricecheck_player.id] && pricecheck_player.id) {
                setIsLoading(true)

                const player_trades = await axios.post('/trade/pricecheck', {
                    player_id: pricecheck_player.id
                })
                console.log({ pcTrades: player_trades.data })
                pcTrades[pricecheck_player.id] = getTradeTips(player_trades.data, stateLeagues, stateLeaguematesDict, stateState.league_season)
                setStatePriceCheckTrades({ ...pcTrades })

                setIsLoading(false)
            }
        }

        fetchPriceCheckTrades()
    }, [pricecheck_player])

    const trades_headers = [
        [
            {
                text: 'Date',
                colSpan: 2
            },
            {
                text: 'League',
                colSpan: 6
            }
        ]
    ]

    let tradesDisplay;
    let tradeCount;
    switch (tab) {
        case 'Leaguemate Trades':

            if (searched_player === '' && searched_league === '' && searched_manager === '') {
                tradesDisplay = stateLmTrades.trades || []
                tradeCount = stateLmTrades.count
            } else {

                tradesDisplay = stateLmTrades.searches?.player?.find(s => s.id === searched_player.id)?.results
                    ?.filter(trade => searched_manager === '' || trade.managers.includes(searched_manager.id))
                    ||
                    stateLmTrades.searches?.manager?.find(s => s.id === searched_manager.id)?.results
                        ?.filter(trade => searched_player === '' || Object.keys(trade.adds).includes(searched_player.id))
                    ||
                    []

                tradeCount = tradesDisplay?.length

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
            tradesDisplay = (statePriceCheckTrades[pricecheck_player.id] || [])
                ?.filter(
                    trade => searched_player === ''
                        || Object.keys(trade.adds).includes(searched_player.id)
                        || trade.draft_picks.find(pick =>
                            searched_player.id === `${pick.season} ${pick.round}.${pick.season === stateState.league_season && pick.order ? (pick.order).toLocaleString("en-US", { minimumIntegerDigits: 2 }) : null}`
                        )
                )

            tradeCount = tradesDisplay?.length
            break;
        default:
            break;
    }



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
                                                colSpan: 2,
                                                className: 'small'
                                            },
                                            {
                                                text: trade.league?.name,
                                                colSpan: 6,

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
                                        return {
                                            id: rid,
                                            list: [

                                                {
                                                    text: roster?.username || 'Orphan',
                                                    colSpan: 2,
                                                    className: 'left',
                                                    image: {
                                                        src: roster?.avatar,
                                                        alt: 'user avatar',
                                                        type: 'user'
                                                    }
                                                },
                                                {
                                                    text: <ol>
                                                        {
                                                            Object.keys(trade.adds || {}).filter(a => trade.adds[a] === roster?.user_id).map(player_id =>
                                                                <li
                                                                    className={
                                                                        `${trade.tips?.trade_away && trade.tips?.trade_away?.find(p => p.player_id === player_id)?.manager.user_id === rid

                                                                            ? 'red'
                                                                            : ''
                                                                        }`
                                                                    }

                                                                >
                                                                    + {stateAllPlayers[player_id]?.full_name}
                                                                </li>
                                                            )
                                                        }
                                                        {
                                                            trade.draft_picks
                                                                .filter(p => p.owner_id === roster?.roster_id)
                                                                .sort((a, b) => (a.season) - b.season || a.round - b.round)
                                                                .map(pick =>
                                                                    <li
                                                                        className={`${trade.tips?.trade_away && trade.tips?.trade_away
                                                                            ?.find(p =>
                                                                                p?.player_id?.season === pick.season
                                                                                && p?.player_id?.round === pick.round
                                                                                && p?.player_id?.order === pick.order
                                                                            )?.manager?.user_id === rid ? 'red' : ''}`}
                                                                    >
                                                                        {
                                                                            `+ ${pick.season} Round ${pick.round}${pick.order && pick.season === stateState.league_season ? `.${pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : ` (${pick.original_user?.username || 'Orphan'})`}`
                                                                        }
                                                                    </li>
                                                                )
                                                        }
                                                    </ol>,
                                                    colSpan: 3,
                                                    className: 'small left'
                                                },
                                                {
                                                    text: <ol>
                                                        {
                                                            Object.keys(trade.drops || {}).filter(d => trade.drops[d] === roster?.user_id).map(player_id =>

                                                                <li
                                                                    className={
                                                                        `${trade.tips?.acquire && trade.tips?.acquire?.find(p => p.player_id === player_id)?.manager?.user_id === rid
                                                                            ? 'green'
                                                                            : ''
                                                                        }`
                                                                    }
                                                                >
                                                                    <span className='end'>
                                                                        {
                                                                            (`- ${stateAllPlayers[player_id]?.full_name}`).toString()
                                                                        }
                                                                    </span>
                                                                </li>

                                                            )
                                                        }
                                                        {
                                                            trade.draft_picks
                                                                .filter(p => p.previous_owner_id === roster?.roster_id)
                                                                .sort((a, b) => (a.season) - b.season || a.round - b.round)
                                                                .map(pick =>
                                                                    <li className={`end ${trade.tips?.acquire && trade.tips?.acquire
                                                                        ?.find(p =>
                                                                            p?.player_id?.season === pick.season
                                                                            && p?.player_id?.round === pick.round
                                                                            && p?.player_id?.order === pick.order
                                                                        )?.manager?.user_id === rid ? 'green' : ''}`}>
                                                                        <span className="end">
                                                                            {
                                                                                (`- ${pick.season} Round ${pick.round}${pick.order && pick.season === stateState.league_season ? `.${pick.order.toLocaleString("en-US", { minimumIntegerDigits: 2 })}` : ` (${pick.original_user?.username || 'Orphan'})`}`).toString()
                                                                            }
                                                                        </span>
                                                                    </li>
                                                                )
                                                        }
                                                    </ol>,
                                                    colSpan: 3,
                                                    className: 'small left'
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
                                    })

                                ]
                            }
                        />,
                        colSpan: 8,
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
                        list={searched_manager.id ? players_list2 : players_list}
                        tab={tab}
                    />
                    <Search
                        id={'By Manager'}
                        sendSearched={(data) => setSearched_Manager(data)}
                        placeholder={`Manager`}
                        list={searched_player.id ? managers_list2 : managers_list}
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
                                    sendSearched={(data) => setSearched_Player(data)}
                                    placeholder={`Player`}
                                    list={pricecheck_player.id ? players_list2 : players_list}
                                    tab={tab}
                                />
                                <Search
                                    id={'By Manager'}
                                    sendSearched={(data) => setSearched_Manager(data)}
                                    placeholder={`Manager`}
                                    list={pricecheck_player.id ? managers_list2 : managers_list}
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
        setIsLoading(true)
        let trades = stateLmTrades.trades;
        let tradesMore = await axios.post('/trade/leaguemate', {
            user_id: state_user.user_id,
            leaguemates: Object.keys(stateLeaguematesDict),
            offset: trades.length,
            limit: 250
        })

        setPage(Math.ceil(stateLmTrades.trades.length / 25) + 1)
        setStateLmTrades({
            ...stateLmTrades,
            trades: [...stateLmTrades.trades, ...getTradeTips(tradesMore.data.rows, stateLeagues, stateLeaguematesDict, stateState.league_season)]
        })

        setIsLoading(false)
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
                disabled={isLoading}
            >
                <option>Price Check </option>
                <option>Leaguemate Trades</option>
            </select>
        </div>
        <div className="trade_search_wrapper">

            {searchBar}
        </div>
        {
            isLoading ?
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
                    isLoading={isLoading}
                />
        }
    </>
}

export default Trades;