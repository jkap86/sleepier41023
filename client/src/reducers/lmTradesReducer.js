const initialState = {
    isLoading: true,
    lmTrades: {
        count: 0,
        trades: []
    },
    error: null
};


const lmTradesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_LMTRADES_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_LMTRADES_SUCCESS':
            return {
                ...state,
                lmTrades: {
                    count: action.payload.count,
                    trades: action.payload.trades
                },
                isLoading: false
            };
        case 'FETCH_LMTRADES_FAILURE':
            return { ...state, isLoading: false, error: action.payload };
        default:
            return state;
    }
};

export default lmTradesReducer