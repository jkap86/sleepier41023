import TableMain from "../Home/tableMain";
import { useState } from "react";

const PlayerLeagues = ({ leagues_owned, leagues_taken, leagues_available }) => {
    const [tab, setTab] = useState('Owned');
    const [page, setPage] = useState(1)

    const player_leagues_headers = [
        [
            {
                text: 'League',
                colSpan: 3,
                className: 'half'
            },
            {
                text: 'Rank',
                colSpan: 1,
                className: 'half'
            },
            tab === 'Taken' ?
                {
                    text: 'Manager',
                    colSpan: 2,
                    className: 'half'
                }
                :
                ''
        ]
    ]

    const leagues_display = tab === 'Owned' ? leagues_owned :
        tab === 'Taken' ? leagues_taken :
            tab === 'Available' ? leagues_available :
                null

    const player_leagues_body = leagues_display.map(lo => {
        return {
            id: lo.league_id,
            list: [
                {
                    text: lo.name,
                    colSpan: 3,
                    className: 'left',
                    image: {
                        src: lo.avatar,
                        alt: lo.name,
                        type: 'league'
                    }
                },
                {
                    text: lo.userRoster?.rank,
                    colSpan: 1,
                    className: lo.userRoster?.rank / lo.rosters.length <= .25 ? 'green' :
                        lo.userRoster?.rank / lo.rosters.length >= .75 ? 'red' :
                            null
                },
                tab === 'Taken' ?
                    {
                        text: lo.lmRoster?.username || 'Orphan',
                        colSpan: 2,
                        className: 'left end',
                        image: {
                            src: lo.lmRoster?.avatar,
                            alt: lo.lmRoster?.username,
                            type: 'user'
                        }
                    }
                    :
                    ''
            ]
        }
    })

    return <>
        <div className="secondary nav">
            <button
                className={tab === 'Owned' ? 'active click' : 'click'}
                onClick={() => setTab('Owned')}
            >
                Owned
            </button>
            <button
                className={tab === 'Taken' ? 'active click' : 'click'}
                onClick={() => setTab('Taken')}
            >
                Taken
            </button>
            <button
                className={tab === 'Available' ? 'active click' : 'click'}
                onClick={() => setTab('Available')}
            >
                Available
            </button>
        </div>
        <TableMain
            type={'secondary'}
            headers={player_leagues_headers}
            body={player_leagues_body}
            page={page}
            setPage={setPage}
        />
    </>
}

export default PlayerLeagues;