import TableMain from "../Home/tableMain";
import { useState } from "react";
import headshot from '../../images/headshot.png';
import PlayerLeagues from "./player_leagues";
import TeamFilter from "../Home/teamFilter";

const Players = ({
    stateAllPlayers,
    state_user,
    statePlayerShares,
    leagues_count
}) => {
    const [itemActive, setItemActive] = useState('');
    const [page, setPage] = useState(1)
    const [searched, setSearched] = useState('')
    const [filterPosition, setFilterPosition] = useState('W/R/T/Q')

    const playerShares_headers = [
        [
            {
                text: 'Player',
                colSpan: 4,
                rowSpan: 2,
                className: 'half'
            },
            {
                text: 'Owned',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Taken',
                colSpan: 2,
                className: 'half'
            },
            {
                text: 'Available',
                colSpan: 2,
                className: 'half'
            }
        ],
        [
            {
                text: 'Total',
                colSpan: 1,
                className: 'half'
            },
            {
                text: '%',
                colSpan: 1,
                className: 'half'
            },
            {
                text: 'Total',
                colSpan: 1,
                className: 'half'
            },
            {
                text: '%',
                colSpan: 1,
                className: 'half'
            },
            {
                text: 'Total',
                colSpan: 1,
                className: 'half'
            },
            {
                text: '%',
                colSpan: 1,
                className: 'half'
            }
        ]
    ]

    const playerShares_body = statePlayerShares
        .filter(x => (x.id.includes('_') || stateAllPlayers[x.id])
            && (
                filterPosition === stateAllPlayers[x.id]?.position
                || filterPosition.split('/').includes(stateAllPlayers[x.id]?.position?.slice(0, 1))
                || (
                    filterPosition === 'Picks' && x.id.includes('_')
                )
            )
        )
        .sort((a, b) => b.leagues_owned.length - a.leagues_owned.length)
        .map(player => {
            let pick_name;
            if (player.id.includes('_')) {
                const pick_split = player.id.split('_')
                pick_name = `${pick_split[0]} ${pick_split[1]}.${pick_split[2].toLocaleString("en-US", { minimumIntegerDigits: 2 })}`
            }

            return {
                id: player.id,
                search: {
                    text: stateAllPlayers[player.id]?.full_name || pick_name,
                    image: {
                        src: player.id,
                        alt: 'player photo',
                        type: 'player'
                    }
                },
                list: [
                    {
                        text: player.id.includes('_') ? pick_name : stateAllPlayers[player.id]?.full_name || `INACTIVE PLAYER`,
                        colSpan: 4,
                        className: 'left',
                        image: {
                            src: stateAllPlayers[player.id] ? player.id : headshot,
                            alt: stateAllPlayers[player.id]?.full_name || player.id,
                            type: 'player'
                        }
                    },
                    {
                        text: player.leagues_owned.length.toString(),
                        colSpan: 1,
                        className: 'green'
                    },
                    {
                        text: ((player.leagues_owned.length / leagues_count) * 100).toFixed(1) + '%',
                        colSpan: 1,
                        className: 'green'
                    },
                    {
                        text: player.leagues_taken.length.toString(),
                        colSpan: 1,
                        className: 'red'
                    },
                    {
                        text: ((player.leagues_taken.length / leagues_count) * 100).toFixed(1) + '%',
                        colSpan: 1,
                        className: 'red'
                    },
                    {
                        text: player.id.includes('_') ? '-' : player.leagues_available?.length || '0',
                        colSpan: 1,
                        className: 'yellow'
                    },
                    {
                        text: player.id.includes('_') ? '-' : ((player.leagues_available.length / leagues_count) * 100).toFixed(1) + '%',
                        colSpan: 1,
                        className: 'yellow'
                    }
                ],
                secondary_table: (
                    <PlayerLeagues
                        leagues_owned={player.leagues_owned}
                        leagues_taken={player.leagues_taken}
                        leagues_available={player.leagues_available}
                    />
                )
            }
        })

    const teamFilter = <TeamFilter
        filterPosition={filterPosition}
        setFilterPosition={setFilterPosition}
        picks={true}
    />

    return <>

        <TableMain
            id={'Players'}
            type={'main'}
            headers={playerShares_headers}
            body={playerShares_body}
            page={page}
            setPage={setPage}
            itemActive={itemActive}
            setItemActive={setItemActive}
            search={true}
            searched={searched}
            setSearched={setSearched}
            options={[teamFilter]}
        />
    </>
}

export default Players;