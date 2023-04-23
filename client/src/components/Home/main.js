import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { loadingIcon } from "../Functions/misc";
import View from "./view";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeagues, fetchLmTrades, fetchUser } from '../../actions/actions';


const Main = () => {
    const params = useParams();
    const [statePriceCheckTrades, setStatePriceCheckTrades] = useState([])
    const dispatch = useDispatch();
    const { user, isLoading: isLoadingUser, error: errorUser } = useSelector((state) => state.user);
    const { state, allPlayers, nflSchedule, leagues, leaguemates, leaguematesDict, playerShares, isLoading: isLoadingLeagues, error: errorLeagues } = useSelector(state => state.leagues)
    const { lmTrades, isLoading: isLoadingLmTrades, error: errorLmTrades } = useSelector(state => state.lmTrades);

    useEffect(() => {
        dispatch(fetchUser(params.username));
    }, [params.username, dispatch])


    useEffect(() => {
        /*
        const fetchLeagues = async () => {

            const [home, leagues] = await Promise.all([
                await axios.get('/home'),

                await axios.post('/league/find', {
                    user_id: user?.user_id
                })
            ])

            const data = getLeagueData(leagues.data, user?.user_id, home.data.state)

            setStateState(home.data.state)
            setStateAllPlayers(home.data.allplayers)
            setStateNflSchedule(home.data.schedule)


            setStateLeagues(data.leagues)
            setStatePlayerShares(data.players)
            setStateLeaguemates(data.leaguemates)
            setStateLeaguematesDict(data.leaguematesDict)


        }
        if (user?.user_id) {
            fetchLeagues()
        }
        */

        if (user?.user_id) {
            dispatch(fetchLeagues(user.user_id))
        }
    }, [user])

    useEffect(() => {
        /*
        const fetchTrades = async () => {
            setIsLoadingTrades(true)


            let trades = stateLmTrades.trades;

            if (!trades) {
                trades = await axios.post('/trade/leaguemate', {
                    user_id: user.user_id,
                    leaguemates: Object.keys(leaguematesDict),
                    offset: stateLmTrades.length,
                    limit: 125
                })
                console.log(trades.data)

                setStateLmTrades({
                    ...stateLmTrades,
                    count: trades.data.count,
                    leagues: trades.data.leagues,
                    trades: getTradeTips(trades.data.rows, leagues, leaguematesDict, state.league_season)
                })


            }


            setIsLoadingTrades(false)
        }
        */

        if (user?.user_id && Object.keys(leaguematesDict).length > 0) {
            dispatch(fetchLmTrades(user.user_id, Object.keys(leaguematesDict), leagues, state.league_season, lmTrades?.trades?.length || 0, 125))
        }
    }, [user, leaguematesDict])





    const syncLeague = async (league_id) => {
        /*
        const leagues = leagues
        const syncdMatchup = await axios.post('/league/sync', {
            league_id: league_id
        })
        const leaguesSynced = leagues.map(league => {
            if (league.league_id === league_id) {
                league = {
                    ...league,
                    [`matchups_${state.display_week}`]: syncdMatchup.data
                }
            }
            return league
        })
        setStateLeagues([...leaguesSynced])
        */
    }

    console.log(isLoadingLeagues)

    return <>
        {
            (isLoadingUser || isLoadingLeagues || !user) ?
                loadingIcon

                : errorUser ? <h1>{errorUser}</h1>
                    : <React.Suspense fallback={loadingIcon}>

                        <View

                            setStateLmTrades={console.log}

                            statePriceCheckTrades={statePriceCheckTrades}
                            setStatePriceCheckTrades={setStatePriceCheckTrades}

                            syncLeague={syncLeague}


                        />
                    </React.Suspense>

        }
    </>
}

export default Main;