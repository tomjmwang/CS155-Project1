import React from 'react'
import { useHistory } from 'react-router-dom'
import firebase from '../firebase.js'
var rand = require('randomstring')

function EnterUsername() {
    const hist = useHistory()

    function roomId() {
        const url = window.location.pathname
        return url.length > 6 ? url.substring(7, 14) : undefined
    }

    function Submit() {
        const name = document.getElementById('username').value
        // If username is empty or more than 40 characters
        if (name.length > 40 || name.length === 0) {
            document.getElementById('usernameValidationLabel').innerHTML = 'please enter between 1 and 40 characters'
        }
        // If contains non-alphanumeric
        else if (/[^0-9A-Za-z]/.test(name)) {
            document.getElementById('usernameValidationLabel').innerHTML = 'please enter alphanumeric only'
        } else {
            const id = roomId()
            const games = firebase.database().ref('games')
            // If URL doesn't have id, create room
            if (!id) {
                const id = rand.generate(7)
                const cards = {
                    true_deck: [""],
                    lie_deck:[""]
                }
                const game = {
                    liar: "",
                    players: [
                        name
                    ],
                    stage: 0,
                    cards: cards,
                    current_player: 0,
                    current_card: {name: "", val: true},
                    votes: {true_count: 0, lie_count:0},
                    vote_result: "",
                    turn_count: 0,
                    end_condition_count: 0,
                    round_count: 1,
                    info: {true_count: 0, lie_count:0}
                }
                games.child(id).set(game)
                hist.replace('/room/' + id + '&name=' + name)
            }
            // If URL has id, join existing room
            else {
                const player = document.getElementById('username').value
                games.child(id).child('players').push(player)
                hist.replace('/room/' + id + '&name=' + name)
            }
        }
    }

    function enterViewMode() {
        // This should not collide with any usernames, as it is not alphanumeric.
        hist.replace(`/room/${roomId()}&name=_`)
    }

    return (
        <div className='root'>
            <div className='container'>
                <label className='usernameLabel' htmlFor='username'>username:</label> {/*check for uniqueness, or just add a number to the end if not unique*/}
                <input className='usernameInput' type='text' id='username' />
                <button className='block' onClick={Submit} style={{ marginLeft: 'auto', marginRight: 'auto' }}>enter</button>
                <p className='usernameValidationLabel' id='usernameValidationLabel'>(alphanumeric only)</p>

                {roomId() && <div>
                    <button className='block' onClick={enterViewMode} style={{ marginLeft: 'auto', marginRight: 'auto' }}>use screen share mode</button>
                    <p className='usernameValidationLabel' id='usernameValidationLabel'>Good for screen sharing on zoom! No secrets leaked here ;)</p>
                </div>}
            </div>
        </div>
    );
}

export default EnterUsername;
