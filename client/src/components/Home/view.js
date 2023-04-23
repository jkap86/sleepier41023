import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Heading from "./heading";
import { filterData } from "../Functions/filterData";
import Players from '../Players/players';
import Leagues from '../Leagues/leagues';
import Leaguemates from '../Leaguemates/leaguemates';
import Trades from '../Trades/trades';
import Lineups from "../Lineups/lineups";
import { useSelector, useDispatch } from 'react-redux';

const View = ({
    setStateLmTrades,
    statePriceCheckTrades,
    setStatePriceCheckTrades,
    syncLeague
}) => {
    const [tab, setTab] = useState('Players');
    const [type1, setType1] = useState('All');
    const [type2, setType2] = useState('All');
    const [stateLeaguesFiltered, setStateLeaguesFiltered] = useState([]);
    const [statePlayerSharesFiltered, setStatePlayerSharesFiltered] = useState([]);
    const [stateLeaguematesFiltered, setStateLeaguematesFiltered] = useState([]);
    const [uploadedRankings, setUploadedRankings] = useState({})
    const { user, isLoading: isLoadingUser, error: errorUser } = useSelector((state) => state.user);
    const { state, allPlayers, nflSchedule, leagues, leaguemates, leaguematesDict, playerShares, isLoading: isLoadingLeagues, error: errorLeagues } = useSelector(state => state.leagues)
    const { lmTrades, isLoading: isLoadingLmTrades, error: errorLmTrades } = useSelector(state => state.lmTrades);


    useEffect(() => {
        const filtered_data = filterData(leagues, type1, type2, leaguemates, playerShares)

        setStateLeaguesFiltered([...filtered_data.leagues])
        setStatePlayerSharesFiltered([...filtered_data.playershares])
        setStateLeaguematesFiltered([...filtered_data.leaguemates])

        console.log(filtered_data)

    }, [user, leagues, type1, type2, leaguemates, playerShares])


    let display;

    switch (tab) {
        case 'Players':
            display = <Players

                statePlayerShares={statePlayerSharesFiltered}
                leagues_count={stateLeaguesFiltered.length}

            />
            break;
        case 'Leaguemates':
            display = <Leaguemates
                stateAllPlayers={allPlayers}
                state_user={user}
                stateLeaguemates={stateLeaguematesFiltered}
            />
            break;
        case 'Leagues':
            display = <Leagues
                stateAllPlayers={allPlayers}
                state_user={user}
                stateLeagues={stateLeaguesFiltered}
            />
            break;
        case 'Trades':
            display = <Trades

                setStateLmTrades={setStateLmTrades}
                statePriceCheckTrades={statePriceCheckTrades}
                setStatePriceCheckTrades={setStatePriceCheckTrades}

            />
            break;
        case 'Lineups':
            display = <Lineups
                stateLeagues={stateLeaguesFiltered}
                stateAllPlayers={allPlayers}
                uploadedRankings={uploadedRankings}
                setUploadedRankings={setUploadedRankings}
                stateState={state}
                state_user={user}
                stateNflSchedule={nflSchedule}
                syncLeague={syncLeague}
            />
            break;
        default:
            display = null
            break;
    }


    return <>
        <Link to="/" className="home">
            Home
        </Link>
        <Heading
            stateState={state}
            state_user={user}
            stateLeaguesFiltered={stateLeaguesFiltered}
            tab={tab}
            setTab={setTab}
            type1={type1}
            setType1={setType1}
            type2={type2}
            setType2={setType2}
        />
        {display}
    </>
}

export default View;