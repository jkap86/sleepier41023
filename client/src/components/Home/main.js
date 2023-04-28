import { useParams } from "react-router-dom";
import React, { useEffect } from "react";
import { loadingIcon } from "../Functions/misc";
import View from "./view";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeagues, fetchLmTrades, fetchUser, setTab, setType1, setType2 } from '../../actions/actions';


const Main = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { user, isLoading: isLoadingUser, error: errorUser } = useSelector((state) => state.user);
    const { state, leagues, leaguematesDict, isLoading: isLoadingLeagues } = useSelector(state => state.leagues)
    const { lmTrades } = useSelector(state => state.lmTrades);
    const { tab, type1, type2 } = useSelector(state => state.tab)


    useEffect(() => {
        dispatch(fetchUser(params.username));
        dispatch(setTab('Players'));
        dispatch(setType1('All'))
        dispatch(setType2('All'))
    }, [params.username, dispatch])

    useEffect(() => {
        if (user?.user_id) {
            dispatch(fetchLeagues(user.user_id, tab))
        }
    }, [user])


    useEffect(() => {

        if (user?.user_id && Object.keys(leaguematesDict).length > 0) {
            dispatch(fetchLmTrades(user.user_id, Object.keys(leaguematesDict), leagues, state.league_season, lmTrades?.trades?.length || 0, 125))
        }
    }, [user, leaguematesDict])


    return <>
        {
            (isLoadingUser || isLoadingLeagues || !user) ?
                loadingIcon

                : errorUser ? <h1>{errorUser}</h1>
                    : <React.Suspense fallback={loadingIcon}>

                        <View />
                    </React.Suspense>

        }
    </>
}

export default Main;