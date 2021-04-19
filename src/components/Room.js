import React from 'react'
import firebase from '../firebase.js'

// Create wordsets
let all_questions = [
"What is one of your favorite life hacks?",
"What television show or movie makes you laugh the hardest and why?",
"Are you a cat person or dog person?",
"Who do you most admire and why?",
"Do you think you're courageous or timid? Why?",
"Which is harder for you to give: time or money? Why?",
"How old where you when you had your first kiss?",
"What is the silliest thing you have done in front of an unfamiliar crowd?",
"What is the class you got the worst grade in?",
"Have you ever cheated on an exam or quiz? If so, what is the exam on?",
"What is a secret you kept from your parents?",
"Are you a morning person or a night person?",
"How many selfies do you take a day?",
"are you a coffee person or a tea person?",
"describe your favorite childhood show",
"What's the longest time you've ever gone without showering?",
"type 'what is' in your google search bar. What is the most embarassing thing that pops up?",
"what is an embarassing nickname that you once had?",
"Who is your celebrity crush? why?",
"How much toilet paper do you use for one wipe? (can be in number of perforated 'squares')"
]
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
            current_card: {},
            stage: 0,
            liar: "",
            current_player: 0,
            name: window.location.pathname.substring(19),
            vote_result: "",
            voted: false,
            true_deck: [],
            lie_deck: [],
            votes: {true_count: 0, lie_count:0},
        }
        this.startGame = this.startGame.bind(this)
        this.updateVoteTruth = this.updateVoteTruth.bind(this)
        this.updateVoteLie = this.updateVoteLie.bind(this)
        this.restartGame = this.restartGame.bind(this)
    }

    startGame(){
        const id = window.location.pathname.substring(6, 13)
        let game = firebase.database().ref('games').child(id)
        let cards = game.child('cards')
        cards.child('true_deck').get().then((data)=>{
            let new_card_deck = data.val()
            let new_card = new_card_deck.shift()
            game.update({
                'votes': {true_count: 0, lie_count:0}, 
                'current_card': {name: new_card[0], val: new_card[1]},
                'stage': 1,
                'cards': {
                    true_deck: new_card_deck,
                    lie_deck: []
                }
            })
        })
        
        
    }

    updateVoteTruth(){
        const id = window.location.pathname.substring(6, 13)
        let game = firebase.database().ref('games').child(id)

        game.child('votes').get().then((data)=>{
            let votes = data.val()
            votes.true_count = votes.true_count + 1
            game.update({'votes': votes})
            this.setState({
                voted: true
            })
        })
        
    }

    updateVoteLie(){
        const id = window.location.pathname.substring(6, 13)
        let game = firebase.database().ref('games').child(id)
        game.child('votes').get().then((data)=>{
            let votes = data.val()
            votes.lie_count = votes.lie_count + 1
            game.update({'votes': votes})
            this.setState({
                voted: true
            })
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
            updatedPlayers.sort()
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
                for(let i = 0; i < 10; i++){
                    if(i < 8){
                        true_deck.push([new_questions[i], true])
                    }
                    else{
                        true_deck.push([new_questions[i], false])
                    }
                }
                let selected_questions = {
                    true_deck: true_deck
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
        game.child('vote_result').on('value', vr=>{
            this.setState({
                vote_result: vr.val()
            })
        })
        const votes = game.child('votes')
        votes.on('value', votes => {
            
            if(votes.val().lie_count + votes.val().true_count === this.state.players.length-1 && this.state.players.length !== 1){
                // let true_count = 0
                // let lie_count = 0
                // for(let j = 0; j < votes.val().length; j++){
                //     if (votes.val()[j] === true){
                //         true_count += 1
                //     }
                //     else{
                //         lie_count += 1
                //     }
                // }
                game.child('cards').get().then((cards)=>{
                    let new_true_deck = cards.val().true_deck
                    let new_lie_deck = cards.val().lie_deck
                    let result = "";
                    if(votes.val().lie_count > votes.val().true_count){
                        if(new_lie_deck == null){
                            new_lie_deck = [[this.state.current_card.name, this.state.current_card.val]]
                        }
                        else{
                            new_lie_deck.push([this.state.current_card.name, this.state.current_card.val])
                        }
                        result = "lie deck"
                    }
                    else{
                        new_true_deck.push([this.state.current_card.name, this.state.current_card.val])
                        result = "truth deck"
                    }
                    //check for game ending condition...
                    if(new_lie_deck.length === 4){
                        game.update({
                            'stage': 2,
                            'cards': {
                                true_deck: new_true_deck,
                                lie_deck: new_lie_deck
                            },
                            'vote_result': result
                        })
                    }
                    else{
                        let current_player = this.state.current_player + 1
                        if (current_player === this.state.players.length){
                            current_player = 0
                        }
                        let new_card = new_true_deck.shift()
                        game.update({
                            'votes': {true_count: 0, lie_count:0}, 
                            'current_player': current_player, 
                            'current_card': {name: new_card[0], val:new_card[1]},
                            'cards': {
                                true_deck: new_true_deck,
                                lie_deck: new_lie_deck
                            },
                            'vote_result': result
                        })
                        this.setState({
                            voted: false
                        })
                    }
                })
                
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
                            <p className='linkLabel'>send your friends this code:</p>
                            <p className='link'>{window.location.pathname.substring(6, 13)}</p>
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
                                <p className='promptLabel'>Current Player: {this.state.players[this.state.current_player]}</p>
                                <p className='promptLabel'>Current Question: {this.state.current_card.name}</p>
                            </div>
                            {this.state.name !== this.state.players[this.state.current_player]  && 
                                <div>
                                {this.state.voted === false &&
                                    <div>
                                        <button className='block' onClick={this.updateVoteTruth} style={{ marginTop: '20px', marginLeft: 'auto', marginRight: 'auto' }}>Truth</button>
                                        <button className='block' onClick={this.updateVoteLie} style={{ marginTop: '20px', marginLeft: 'auto', marginRight: 'auto' }}>Lie</button>
                                    </div>
                                }
                                {this.state.voted === true &&
                                    <div className='promptLabel'>
                                        You have voted!
                                    </div>
                                }
                                </div>
                            }
                            <div className='linkLabel'>
                                Last question got put in {this.state.vote_result}.
                            </div>
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
