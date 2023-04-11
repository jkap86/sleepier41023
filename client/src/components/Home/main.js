import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { getLeagueData } from '../Functions/getLeagueData';
import { loadingIcon } from "../Functions/misc";
import View from "./view";

const Main = () => {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [stateState, setStateState] = useState({})
    const [stateAllPlayers, setStateAllPlayers] = useState({});
    const [stateNflSchedule, setStateNflSchedule] = useState({});
    const [state_user, setState_User] = useState({});
    const [stateLeagues, setStateLeagues] = useState([]);
    const [stateLeaguemates, setStateLeaguemates] = useState([]);
    const [stateLeaguematesDict, setStateLeaguematesDict] = useState([]);
    const [statePlayerShares, setStatePlayerShares] = useState([]);
    const [stateLmTrades, setStateLmTrades] = useState({});
    const [stateLmLeaguesTrades, setStateLmLeaguesTrades] = useState({});
    const [statePriceCheckTrades, setStatePriceCheckTrades] = useState({})


    useEffect(() => {
        const fetchLeagues = async () => {
            setIsLoading(true)
            const user = await axios.post('/user/create', {
                username: params.username,
                season: params.season
            })

            if (!user.data?.error) {
                setState_User(user.data[0])
                const home = await axios.get('/home')
                const leagues = await axios.post('/league/find', {
                    user_id: user.data[0]?.user_id,
                    season: params.season
                })

                const data = getLeagueData(leagues.data, user.data[0].user_id, home.data.state, params.season)

                setStateState(home.data.state)
                setStateAllPlayers(home.data.allplayers)
                setStateNflSchedule(home.data.schedule)
                setState_User(user.data[0])
                setStateLeagues(data.leagues)
                setStatePlayerShares(data.players)
                setStateLeaguemates(data.leaguemates)
                setStateLeaguematesDict(data.leaguematesDict)
                setIsLoading(false)
            } else {
                setState_User(user.data)
                setIsLoading(false)
            }
        }
        fetchLeagues()
    }, [params.username, params.season])


    const syncLeague = async (league_id) => {
        const leagues = stateLeagues
        const syncdMatchup = await axios.post('/league/sync', {
            league_id: league_id
        })
        const leaguesSynced = leagues.map(league => {
            if (league.league_id === league_id) {
                league = {
                    ...league,
                    [`matchups_${stateState.display_week}`]: syncdMatchup.data
                }
            }
            return league
        })
        setStateLeagues([...leaguesSynced])
    }
    return <>
        {
            isLoading || !state_user ?
                isLoading && loadingIcon

                : state_user.error ? <h1>{state_user.error}</h1>
                    : <React.Suspense fallback={loadingIcon}>
                        <View
                            stateState={stateState}
                            stateAllPlayers={stateAllPlayers}
                            state_user={state_user}
                            stateLeagues={stateLeagues}
                            stateLeaguemates={stateLeaguemates}
                            stateLeaguematesDict={stateLeaguematesDict}
                            statePlayerShares={statePlayerShares}
                            stateLmTrades={stateLmTrades}
                            setStateLmTrades={setStateLmTrades}
                            stateLmLeaguesTrades={stateLmLeaguesTrades}
                            setStateLmLeaguesTrades={setStateLmLeaguesTrades}
                            statePriceCheckTrades={statePriceCheckTrades}
                            setStatePriceCheckTrades={setStatePriceCheckTrades}
                            stateNflSchedule={stateNflSchedule}
                            syncLeague={syncLeague}
                        />
                    </React.Suspense>

        }
    </>
}

export default Main;