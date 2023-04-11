import { utils, read } from 'xlsx';

export const importRankings = (e, stateAllPlayers, setUploadedRankings) => {
    if (e.target.files[0]) {
        const reader = new FileReader()
        reader.onload = (e) => {
            const data = e.target.result
            const workbook = read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            let json = utils.sheet_to_json(worksheet)

            const cols = Object.keys(json[0])
            const p = cols.find(x => ['player', 'name', 'player name'].includes(x.trim().toLowerCase()))
            const r = cols.find(x => ['rank', 'rk'].includes(x.trim().toLowerCase()))
            const pos = cols.find(x => ['pos', 'position'].includes(x.trim().toLowerCase()))
            const team = cols.find(x => ['team', 'tm'].includes(x.trim().toLowerCase()))

            if (!(p && r && pos)) {
                setUploadedRankings({ error: 'error - column not found' })
                return
            }

            let uploadedRankings = {}
            let notMatched = []

            json.map(player => {
                const player_to_update = matchRankings(player[p].trim().toLowerCase().replace(/[^a-z]/g, ""), player[pos], player[team], stateAllPlayers)
                const rank = player[r]
                if (player_to_update.error) {
                    notMatched.push({
                        name: player[p],
                        rank: rank,
                        position: player[pos],
                        error: player_to_update.error
                    })
                } else {
                    return uploadedRankings[player_to_update.id] = {
                        prevRank: rank,
                        newRank: rank
                    }

                }
            })

            if (uploadedRankings.error) {
                console.log(uploadedRankings.error)
            }



            setUploadedRankings({
                rankings: uploadedRankings,
                notMatched: notMatched
            })

        }
        reader.readAsArrayBuffer(e.target.files[0])
    } else {
        console.log('no file')
    }
}

const matchRankings = (player, position, team, stateAllPlayers) => {

    let start = 0
    let end = 3
    const players_to_search = Object.keys(stateAllPlayers).filter(p => stateAllPlayers[p]?.position === position)
    let matches = players_to_search
        .filter(player_id => player.includes(stateAllPlayers[player_id]?.search_full_name.slice(start, end)) || stateAllPlayers[player_id]?.search_full_name.includes(player.slice(start, end)));

    while (matches.length > 1 && end <= 50) {
        end += 1
        matches = players_to_search
            .filter(player_id => player.includes(stateAllPlayers[player_id]?.search_full_name.slice(start, end)) || stateAllPlayers[player_id]?.search_full_name.includes(player.slice(start, end)));
    }

    if (matches.length === 1) {
        return {
            id: matches[0],
            ...stateAllPlayers[matches[0]]
        }
    } else {
        const matches_team = matches.filter(m => stateAllPlayers[m]?.team === team)
        if (matches_team.length === 1) {
            return {
                id: matches_team[0],
                ...stateAllPlayers[matches_team[0]]
            }
        } else {
            return {
                error: {
                    player: player,
                    position: position,
                    matches: matches

                }
            }
        }
    }

}