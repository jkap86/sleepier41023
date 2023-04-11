import { avatar } from '../Functions/misc';
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from 'react-router-dom';
import './css/heading.css';
import Select from './select';

const Heading = ({
    stateState,
    state_user,
    stateLeaguesFiltered,
    tab,
    setTab,
    type1,
    setType1,
    type2,
    setType2
}) => {
    const params = useParams();
    const navigate = useNavigate();


    return <>
        <div className="heading">

            <h1>
                {stateState.league_season}
            </h1>
            <h1>
                <p className="image">
                    {
                        state_user.avatar && avatar(state_user.avatar, state_user.display_name, 'user')
                    }
                    <strong>
                        {state_user.username}
                    </strong>
                </p>
            </h1>
            <div className="navbar">
                <p className='select'>
                    {tab}&nbsp;<i class="fa-solid fa-caret-down"></i>
                </p>
                <select

                    className="nav active click"
                    value={tab}
                    onChange={(e) => setTab(e.target.value)}
                >
                    <option>Players</option>
                    <option>Trades</option>
                    <option>Leagues</option>
                    <option>Leaguemates</option>
                    <option>Lineups</option>
                </select>

            </div>
            {
                tab === 'Trades' ? null :
                    <div className="switch_wrapper">
                        <div className="switch">
                            <button className={type1 === 'Redraft' ? 'sw active click' : 'sw click'} onClick={() => setType1('Redraft')}>Redraft</button>
                            <button className={type1 === 'All' ? 'sw active click' : 'sw click'} onClick={() => setType1('All')}>All</button>
                            <button className={type1 === 'Dynasty' ? 'sw active click' : 'sw click'} onClick={() => setType1('Dynasty')}>Dynasty</button>
                        </div>
                        <div className="switch">
                            <button className={type2 === 'Bestball' ? 'sw active click' : 'sw click'} onClick={() => setType2('Bestball')}>Bestball</button>
                            <button className={type2 === 'All' ? 'sw active click' : 'sw click'} onClick={() => setType2('All')}>All</button>
                            <button className={type2 === 'Standard' ? 'sw active click' : 'sw click'} onClick={() => setType2('Standard')}>Standard</button>
                        </div>
                    </div>
            }
            <h2>
                {tab === 'Trades' ? null : `${stateLeaguesFiltered.length} Leagues`}
            </h2>
        </div>
    </>
}

export default Heading;