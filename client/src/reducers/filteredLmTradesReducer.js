const initialState = {
    isLoading: false,
    searches: [],
    error: null
};

const filteredLmTradesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_FILTERED_LMTRADES_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_FILTERED_LMTRADES_SUCCESS':

            return { ...state, isLoading: false, searches: [...state.searches, action.payload] };
        case 'FETCH_FILTERED_LMTRADES_FAILURE':
            return { ...state, isLoading: false, error: action.payload };
        default:
            return state;
    }
};

export default filteredLmTradesReducer;

