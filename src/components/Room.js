import React from 'react'
import firebase from '../firebase.js'

// Create wordsets
let all_questions = ["a", "b", "c", "d", "e", "f"]

function shuffle(array){

    var currentIndex = array.length
      , temporaryValue
      , randomIndex
      ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array
}

class Room extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            players: [],
            current_card: [],
            stage: 0,
            liar: "",
            current_player: 0,
            name: window.location.pathname.substring(19),
            vote_result: true,
            voted: false,
            true_deck: [],
            lie_deck: []
        }
        this.updateStage = this.updateStage.bind(this)
        this.startGame = this.startGame.bind(this)
        this.updateVoteTruth = this.updateVoteTruth.bind(this)
        this.updateVoteLie = this.updateVoteLie.bind(this)
        this.restartGame = this.restartGame.bind(this)
    }

    startGame(){
        const id = window.location.pathname.substring(6, 13)
        let game = firebase.database().ref('games').child(id)
        let cards = game.child('cards')
        let new_true_deck = cards.child('true_deck').val()
        let new_card = new_true_deck.shift()
        game.update({
            'votes': [], 
            'current_card': new_card,
            'cards': {
                true_deck: new_true_deck,
                lie_deck: []
            }
        })
    }

    updateVoteTruth(){
        const id = window.location.pathname.substring(6, 13)
        let game = firebase.database().ref('games').child(id)
        let votes = game.child('votes').val()
        votes.push(true)
        game.update({'votes': votes})
        this.setState({
            voted: true
        })
    }

    updateVoteLie(){
        const id = window.location.pathname.substring(6, 13)
        let game = firebase.database().ref('games').child(id)
        let votes = game.child('votes').val()
        votes.push(false)
        game.update({'votes': votes})
        this.setState({
            voted: true
        })
    }

    restartGame(){
        const id = window.location.pathname.substring(6, 13)
        let game = firebase.database().ref('games').child(id)
        game.update({
            stage: 0
        })
    }

    // Based off https://css-tricks.com/building-a-real-time-chat-app-with-react-and-firebase/
    async componentDidMount() {
        const id = window.location.pathname.substring(6, 13)
        let game = firebase.database().ref('games').child(id)
        const players = game.child('players')
        players.on('child_added', player => {
            let updatedPlayers = this.state.players
            updatedPlayers.push(player.val())
            this.setState({
                players: updatedPlayers
            })
        });
        const stage = game.child('stage')
        stage.on('value', stage => {
            this.setState({
                stage: stage.val()
            })
            if (stage.val() === 0) {
                // Determine questions for current round
                let new_questions = shuffle(all_questions)
                let true_deck = []
                let lie_deck = []
                for(let i = 0; i < 10; i++){
                    if(i < 8){
                        true_deck.push([new_questions[i], true])
                    }
                    else{
                        true_deck.push([new_questions[i], false])
                    }
                }
                let selected_questions = {
                    true_deck: true_deck,
                    lie_deck: []
                }
                game.update({ 'cards': selected_questions })
                // Determine liar for current round
                let liar = this.state.players[Math.floor(Math.random() * this.state.players.length)]
                game.update({ 'liar': liar })
            }
        })
        const c = game.child('cards')
        c.on('value', c => {
            this.setState({
                true_deck: c.child('true_deck').val(),
                lie_deck: c.child('lie_deck').val()
            })
        })
        const liar = game.child('liar')
        liar.on('value', liar => {
            this.setState({
                liar: liar.val()
            })
        })
        game.child('current_player').on('value', cp =>{
            this.setState({
                current_player: cp.val()
            })
        })
        game.child('current_card').on('value', card=>{
            this.setState({
                current_card: card.val()
            })
        })
        const votes = game.child('votes')
        votes.on('value', votes => {
            
            if(votes.val().length === this.state.players.length-1){
                let true_count = 0
                let lie_count = 0
                for(let j = 0; j < votes.val().length; j++){
                    if (votes.val()[j] === true){
                        true_count += 1
                    }
                    else{
                        lie_count += 1
                    }
                }
                let cards = game.child('cards')
                let new_true_deck = cards.child('true_deck').val()
                let new_lie_deck = cards.child('lie_deck').val()
                if(lie_count > true_count){
                    new_lie_deck.push(this.state.current_question)
                }
                else{
                    new_true_deck.push(this.state.current_question)
                }
                //check for game ending condition...
                if(new_lie_deck.length === 4){
                    game.update({
                        'stage': 2,
                        'cards': {
                            true_deck: new_true_deck,
                            lie_deck: new_lie_deck
                        }
                    })
                }
                else{
                    let current_player = this.state.current_player + 1
                    if (current_player === this.state.players.length){
                        current_player = 0
                    }
                    let new_card = new_true_deck.shift()
                    game.update({
                        'votes': [], 
                        'current_player': current_player, 
                        'current_card': new_card,
                        'cards': {
                            true_deck: new_true_deck,
                            lie_deck: new_lie_deck
                        }
                    })
                    this.setState({
                        voted: false
                    })
                }
            }
            else{
                this.setState({
                    votes: votes.val()
                })
            }
        })
    }

    render() {
        return (
            <div className='gameScreen'>
                <div className='gameScreenLeft'>
                    <p className='playersLabel'>
                        players:
                    </p>
                    <div className='playersList'>
                        {this.state.players.map((player) =>
                            <li key={player}>{player}</li>
                        )}
                    </div>
                </div>
                <div className='gameScreenRight'>
                    {this.state.stage === 0 && // Waiting room
                        <div>
                            <p className='linkLabel'>send your friends this link:</p>
                            <p className='link'>{'https://cs247g-9d957.web.app' + window.location.pathname.replace('room', 'enter').substring(0, 14)}</p>
                            <button className='block' onClick={this.startGame} style={{ marginTop: '20px', marginLeft: 'auto', marginRight: 'auto' }}>start</button>
                        </div>
                    }
                    {this.state.stage === 1 && // Game started
                        <div>
                            <div className='promptLabel'>
                                {window.location.pathname.substring(19) !== this.state.liar &&
                                    <div>You are a truth-teller.</div>
                                }
                                {window.location.pathname.substring(19) === this.state.liar &&
                                    <div>You are the liar</div>
                                }
                            </div>
                            <div>
                                {this.state.current_question[0]}
                            </div>
                            {this.state.name !== this.state.players[this.state.current_player]  && 
                                <div>
                                    <button className='block' onClick={this.updateVoteTruth} style={{ marginTop: '20px', marginLeft: 'auto', marginRight: 'auto' }}>Truth</button>
                                    <button className='block' onClick={this.updateVoteLie} style={{ marginTop: '20px', marginLeft: 'auto', marginRight: 'auto' }}>Lie</button>
                                </div>
                            }
                        </div>
                    }
                    {this.state.stage === 2 && // Game ended
                        <div>
                            <div className='liarLabel'>
                                {this.state.liar} was the liar!
                            </div>
                            <button className='block' onClick={this.restartGame} style={{ marginTop: '20px', marginLeft: 'auto', marginRight: 'auto' }}>play again</button>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default Room;
