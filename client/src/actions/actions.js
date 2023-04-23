import axios from 'axios';
import { getLeagueData } from '../components/Functions/getLeagueData';
import { getTradeTips } from '../components/Functions/getTradeTips';

export const fetchUser = (username) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_USER_START' });

        try {
            const response = await axios.post('/user/create', { username });
            if (!response.data?.error) {
                dispatch({ type: 'FETCH_USER_SUCCESS', payload: response.data[0] });
            } else {
                dispatch({ type: 'FETCH_USER_FAILURE', payload: response.data });
            }
        } catch (error) {
            dispatch({ type: 'FETCH_USER_FAILURE', payload: error.message });
        }
    };
};


export const fetchLeagues = (user_id) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_LEAGUES_START' });

        try {
            const [home, leagues] = await Promise.all([
                axios.get('/home'),
                axios.post('/league/find', { user_id: user_id }),
            ]);

            const data = getLeagueData(leagues.data, user_id, home.data.state)

            dispatch({
                type: 'FETCH_LEAGUES_SUCCESS', payload: {
                    state: home.data.state,
                    allPlayers: home.data.allplayers,
                    schedule: home.data.schedule,
                    leagues: data.leagues,
                    playerShares: data.players,
                    leaguemates: data.leaguemates,
                    leaguematesDict: data.leaguematesDict,
                }
            })

        } catch (error) {
            dispatch({ type: 'FETCH_LEAGUES_FAILURE', payload: error.message });
        }
    };
};

export const fetchLmTrades = (user_id, leaguemates, leagues, season, offset, limit) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_LMTRADES_START' });

        try {
            const trades = await axios.post('/trade/leaguemate', {
                user_id: user_id,
                leaguemates: leaguemates,
                offset: offset,
                limit: limit
            })

            const trades_tips = getTradeTips(trades.data.rows, leagues, leaguemates, season)

            dispatch({
                type: 'FETCH_LMTRADES_SUCCESS', payload: {
                    count: trades.data.count,
                    trades: trades_tips
                }
            });
        } catch (error) {
            dispatch({ type: 'FETCH_LMTRADES_ERROR', payload: error.message })
        }
    }
}

export const fetchFilteredLmTrades = (searchedPlayerId, searchedManagerId, league_season) => async (dispatch, getState) => {
    dispatch({ type: 'FETCH_FILTERED_LMTRADES_START' });

    const state = getState();
    console.log(state)
    const { user, leagues } = state;

    const searches = state.filteredLmTrades.searches;
    console.log({ searches: searches })

    if (!searches.find((s) => s.player === searchedPlayerId && s.manager === searchedManagerId)) {

        try {
            const trades = await axios.post('/trade/leaguemate', {
                user_id: user.user_id,
                leaguemates: Object.keys(leagues.leaguematesDict),
                player: searchedPlayerId,
                manager: searchedManagerId,
                offset: 0,
                limit: 125,
            });

            const trades_tips = getTradeTips(trades.data.rows, leagues.leagues, leagues.leaguematesDict, league_season)
            console.log(trades_tips)
            dispatch({
                type: 'FETCH_FILTERED_LMTRADES_SUCCESS',
                payload: {
                    player: searchedPlayerId,
                    manager: searchedManagerId,
                    trades: trades_tips,
                    count: trades.data.count,
                },
            });
        } catch (error) {
            dispatch({ type: 'FETCH_FILTERED_LMTRADES_FAILURE', payload: error.message });
        }
    }

    console.log('Done fetching filtered trades...')
};

