import { useState } from "react";
import WeeklyRankings from "./weekly_rankings";
import LineupCheck from "./lineup_check";

const Lineups = ({
    uploadedRankings,
    setUploadedRankings,
    stateLeagues,
    stateAllPlayers,
    stateState,
    state_user,
    stateNflSchedule,
    syncLeague
}) => {
    const [tab, setTab] = useState('Weekly Rankings')

    const display = tab === 'Weekly Rankings' ?
        <WeeklyRankings
            stateState={stateState}
            stateAllPlayers={stateAllPlayers}
            tab={tab}
            setTab={setTab}
            uploadedRankings={uploadedRankings}
            setUploadedRankings={setUploadedRankings}
            stateNflSchedule={stateNflSchedule}
        />
        :
        <LineupCheck
            tab={tab}
            setTab={setTab}
            uploadedRankings={uploadedRankings}
            stateLeagues={stateLeagues}
            stateState={stateState}
            stateAllPlayers={stateAllPlayers}
            state_user={state_user}
            syncLeague={syncLeague}
            stateNflSchedule={stateNflSchedule}
        />

    return <>
        {display}
    </>
}

export default Lineups;