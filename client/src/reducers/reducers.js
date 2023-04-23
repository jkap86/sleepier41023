import { combineReducers } from 'redux';
import userReducer from './userReducer';
import leaguesReducer from './leaguesReducer';
import lmTradesReducer from './lmTradesReducer';
import filteredLmTradesReducer from './filteredLmTradesReducer';

const rootReducer = combineReducers({
    user: userReducer,
    leagues: leaguesReducer,
    lmTrades: lmTradesReducer,
    filteredLmTrades: filteredLmTradesReducer
});

export default rootReducer;


