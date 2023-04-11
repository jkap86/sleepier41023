import { useState } from "react";
import TableMain from "../Home/tableMain";
import { importRankings } from '../Functions/importRankings';
import { matchTeam } from "../Functions/misc";
import { getNewRank } from "../Functions/getNewRank";

const WeeklyRankings = ({
    stateAllPlayers,
    tab,
    setTab,
    uploadedRankings,
    setUploadedRankings,
    stateState,
    stateNflSchedule
}) => {
    const [itemActive, setItemActive] = useState('');
    const [page, setPage] = useState(1)
    const [searched, setSearched] = useState('')
    const [edit, setEdit] = useState(false)

    console.log(uploadedRankings)

    const weekly_rankings_headers = [
        [
            {
                text: 'Player',
                colSpan: 3
            },
            {
                text: 'Opp',
                colSpan: 1
            },
            {
                text: 'Kickoff',
                colSpan: 1
            },
            {
                text: edit ? <span><i
                    onClick={() => setEdit(false)}
                    className={'fa fa-trash clickable'}
                ></i> Rank</span> : <span>Rank  <i
                    onClick={() => setEdit(true)}
                    className={'fa fa-edit clickable'}
                ></i></span>,
                colSpan: 1
            },
            edit && {
                text: <span>Update <i
                    onClick={() => handleRankSave(false)}
                    className={'fa fa-save clickable'}
                ></i></span>,
                colSpan: 1
            }
        ]
    ]

    const weekly_rankings_body = Object.keys(uploadedRankings.rankings || {})
        ?.sort((a, b) => uploadedRankings.rankings[a].prevRank - uploadedRankings.rankings[b].prevRank)
        ?.map(player_id => {
            return {
                id: player_id,
                search: {
                    text: stateAllPlayers[player_id]?.full_name,
                    image: {
                        src: player_id,
                        alt: 'player headshot',
                        type: 'player'
                    }
                },
                list: [
                    {
                        text: stateAllPlayers[player_id]?.full_name,
                        colSpan: 3,
                        className: 'left',
                        image: {
                            src: player_id,
                            alt: 'player headshot',
                            type: 'player'
                        }
                    },
                    {
                        text: matchTeam(stateNflSchedule[stateState.display_week]
                            ?.find(matchup => matchup.team.find(t => matchTeam(t.id) === stateAllPlayers[player_id]?.team))
                            ?.team
                            ?.find(team => matchTeam(team.id) !== stateAllPlayers[player_id]?.team)
                            ?.id) || 'FA'
                        ,
                        colSpan: 1
                    },
                    {
                        text: 'Kickoff',
                        colSpan: 1
                    },
                    {
                        text: uploadedRankings.rankings[player_id].prevRank,
                        colSpan: 1
                    },
                    edit && {
                        text: <input
                            value={uploadedRankings.rankings[player_id].newRank}
                            className={'editRank'}
                            onChange={(e) => handleRankChange([{ rank: e.target.value, player_id: player_id }])}
                        />,
                        colSpan: 1
                    }
                ]
            }
        })

    const handleRankChange = (players_to_update) => {
        let r = uploadedRankings.rankings

        players_to_update.map(player_to_update => {
            const prevRank = r[player_to_update.player_id].newRank
            const newRank = parseInt(player_to_update.rank) || ' '

            console.log({
                prevRank: prevRank,
                newRank: newRank
            })

            if ((newRank >= 0 && newRank <= 1000) || player_to_update.rank.trim() === '') {
                Object.keys(r)
                    .map((player, index) => {
                        if (player !== player_to_update.player_id) {
                            let incrementedRank = getNewRank(prevRank, newRank, r[player].newRank)
                            r[player].newRank = incrementedRank
                        } else {
                            r[player].newRank = newRank
                        }
                    })
            }
        })
        setUploadedRankings({
            ...uploadedRankings,
            rankings: { ...r }
        })
    }

    const handleRankSave = () => {

        let r = uploadedRankings.rankings

        Object.keys(r).map(player_id => {
            return r[player_id].prevRank = r[player_id].newRank
        })
        setUploadedRankings({
            ...uploadedRankings,
            rankings: { ...r }
        })
        setEdit(false)
    }

    const unmatched = uploadedRankings.notMatched?.map(p => `${p.position} ${p.name} Rank: ${p.rank}`)

    return <>
        <div className='navbar'>
            <p className='select'>
                {tab}&nbsp;<i class="fa-solid fa-caret-down"></i>
            </p>

            <select
                className='trades'
                onChange={(e) => setTab(e.target.value)}
                value={tab}

            >
                <option>Weekly Rankings</option>
                <option>Lineup Check</option>
            </select>
        </div>
        <h1>
            Week {stateState.display_week}
            <label className='upload'>
                <i
                    className={'fa fa-upload clickable right'}
                >
                </i>
                <input
                    type={'file'}
                    onChange={(e) => importRankings(e, stateAllPlayers, setUploadedRankings)}
                />
            </label>
        </h1>
        <h1 >{uploadedRankings.notMatched?.length && uploadedRankings.notMatched?.length + ' Not Matched'} </h1>

        <TableMain
            id={'Rankings'}
            type={'main'}
            headers={weekly_rankings_headers}
            body={weekly_rankings_body}
            page={page}
            setPage={setPage}

            search={true}
            searched={searched}
            setSearched={setSearched}

        />
    </>
}

export default WeeklyRankings;