import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Heading from "./heading";
import { filterData } from "../Functions/filterData";
import Players from '../Players/players';
import Leagues from '../Leagues/leagues';
import Leaguemates from '../Leaguemates/leaguemates';
import Trades from '../Trades/trades';


const View = ({
    stateState,
    stateAllPlayers,
    state_user,
    stateLeagues,
    stateLeaguemates,
    stateLeaguematesDict,
    statePlayerShares,
    stateLmTrades,
    setStateLmTrades,
    stateLmLeaguesTrades,
    setStateLmLeaguesTrades,
    statePriceCheckTrades,
    setStatePriceCheckTrades
}) => {
    const [tab, setTab] = useState('Players');
    const [type1, setType1] = useState('All');
    const [type2, setType2] = useState('All');
    const [stateLeaguesFiltered, setStateLeaguesFiltered] = useState([]);
    const [statePlayerSharesFiltered, setStatePlayerSharesFiltered] = useState([]);
    const [stateLeaguematesFiltered, setStateLeaguematesFiltered] = useState([]);


    useEffect(() => {
        const filtered_data = filterData(stateLeagues, type1, type2, stateLeaguemates, statePlayerShares)

        setStateLeaguesFiltered([...filtered_data.leagues])
        setStatePlayerSharesFiltered([...filtered_data.playershares])
        setStateLeaguematesFiltered([...filtered_data.leaguemates])

        console.log(filtered_data)

    }, [state_user, stateLeagues, type1, type2, stateLeaguemates, statePlayerShares])


    let display;

    switch (tab) {
        case 'Players':
            display = <Players
                stateAllPlayers={stateAllPlayers}
                state_user={state_user}
                statePlayerShares={statePlayerSharesFiltered}
                leagues_count={stateLeaguesFiltered.length}
            />
            break;
        case 'Leaguemates':
            display = <Leaguemates
                stateAllPlayers={stateAllPlayers}
                state_user={state_user}
                stateLeaguemates={stateLeaguematesFiltered}
            />
            break;
        case 'Leagues':
            display = <Leagues
                stateAllPlayers={stateAllPlayers}
                state_user={state_user}
                stateLeagues={stateLeaguesFiltered}
            />
            break;
        case 'Trades':
            display = <Trades
                stateState={stateState}
                stateAllPlayers={stateAllPlayers}
                state_user={state_user}
                stateLmTrades={stateLmTrades}
                setStateLmTrades={setStateLmTrades}
                stateLmLeaguesTrades={stateLmLeaguesTrades}
                setStateLmLeaguesTrades={setStateLmLeaguesTrades}
                statePriceCheckTrades={statePriceCheckTrades}
                setStatePriceCheckTrades={setStatePriceCheckTrades}
                stateLeaguematesDict={stateLeaguematesDict}
                stateLeagues={stateLeagues}
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
            stateState={stateState}
            state_user={state_user}
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