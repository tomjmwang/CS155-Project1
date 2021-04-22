import React from 'react'
import firebase from '../firebase.js'

// Create wordsets
const all_questions = [
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

const MIN_NUMBER_PLAYERS = 4
const GAME_END_TURN_COUNT = 8
const LIE_DECK_END_COUNT = 4

const TRUTH_CARD_TOTAL_COUNT = 6
const LIE_CARD_TOTAL_COUNT = 2

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
            turn_count: 0,
            end_condition_count: 0,
            round_count: 1,
            info: {true_count: 0, lie_count:0},
            answers: [""],
            current_votes: {},
            current_vote: "",
        }
        this.startGame = this.startGame.bind(this)
        this.updateVoteTruth = this.updateVoteTruth.bind(this)
        this.updateVoteLie = this.updateVoteLie.bind(this)
        this.restartGame = this.restartGame.bind(this)
    }

    isViewingMode() {
        return this.state.name === '_'
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
                },
                'turn_count': 0,
                'end_condition_count': 0,
                'round_count': 1,
                'info': {true_count: TRUTH_CARD_TOTAL_COUNT, lie_count: LIE_CARD_TOTAL_COUNT},
                'answers': [""],
                current_votes: {}
            })
        })


    }

    updateVoteTruth(){
        const id = window.location.pathname.substring(6, 13)
        let game = firebase.database().ref('games').child(id)

        game.child('votes').get().then((data)=>{
            let votes = data.val()
            votes.true_count += 1
            game.update({'votes': votes})
            this.setState({
                voted: true,
                current_vote: "honest"
            })
        })

    }

    updateVoteLie(){
        const id = window.location.pathname.substring(6, 13)
        let game = firebase.database().ref('games').child(id)
        game.child('votes').get().then((data)=>{
            let votes = data.val()
            votes.lie_count += 1
            game.update({'votes': votes})
            this.setState({
                voted: true,
                current_vote: "dishonest"
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
                for (let i = 0; i < TRUTH_CARD_TOTAL_COUNT + LIE_CARD_TOTAL_COUNT; i++){
                    if(i < TRUTH_CARD_TOTAL_COUNT){
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
        game.child('turn_count').on('value', tc=>{
            this.setState({
                turn_count: tc.val()
            })
        })
        game.child('end_condition_count').on('value', ecc=>{
            this.setState({
                end_condition_count: ecc.val()
            })
        })
        game.child('round_count').on('value', rc=>{
            this.setState({
                round_count: rc.val()
            })
        })
        game.child('info').on('value', info=>{
            this.setState({
                info: info.val()
            })
        })
        game.child('answers').on('value', an=>{
            this.setState({
                answers: an.val()
            })
        })
        game.child('current_votes').on('value', cv=>{
            this.setState({
                current_votes: cv.val()
            })
        })
        const votes = game.child('votes')
        votes.on('value', votes => {
            if(votes.val().lie_count + votes.val().true_count === this.state.players.length - 1){
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
                    if(new_lie_deck == null){
                        new_lie_deck = []
                    }
                    let result = ""
                    let new_end_condition_count = this.state.end_condition_count
                    let new_round_count = this.state.round_count
                    let new_turn_count = this.state.turn_count + 1
                    let new_info = this.state.info
                    let new_answers = this.state.answers
                    if(votes.val().lie_count > votes.val().true_count){
                        new_lie_deck.push([this.state.current_card.name, this.state.current_card.val])
                        result = "lie deck"
                        new_end_condition_count = 0
                        new_answers.push([this.state.players[this.state.current_player], this.state.current_card.name, "a lie"])
                    }
                    else{
                        new_true_deck.push([this.state.current_card.name, this.state.current_card.val])
                        result = "truth deck"
                        new_end_condition_count += 1
                        new_answers.push([this.state.players[this.state.current_player], this.state.current_card.name, "the truth"])
                    }

                    //check for game ending condition...
                    if(new_turn_count >= GAME_END_TURN_COUNT || new_lie_deck.length === LIE_DECK_END_COUNT){
                        let end_info = {true_count:0, lie_count:0}
                        let end_true_count = 0
                        let end_lie_count = 0
                        for(let u = 0; u < this.state.true_deck.length; u++){
                            if(new_true_deck[u][1] === true){
                                    end_true_count += 1
                                }
                                else{
                                    end_lie_count += 1
                                }
                        }
                        end_info = {true_count: end_true_count, lie_count: end_lie_count}
                        game.update({
                            'stage': 2,
                            'cards': {
                                true_deck: new_true_deck,
                                lie_deck: new_lie_deck
                            },
                            'vote_result': result,
                            'info': end_info,
                            'answers': new_answers,
                            'current_votes': {}
                        })
                        this.setState({
                            voted: false
                        })
                    }
                    else{
                        let current_player = this.state.current_player + 1
                        if (current_player === this.state.players.length){
                            current_player = 0
                        }
                        if(new_turn_count % this.state.players.length === 0){
                            let t = 0
                            let l = 0
                            for(let k = 0; k < new_true_deck.length; k++){
                                if(new_true_deck[k][1] === true){
                                    t += 1
                                }
                                else{
                                    l += 1
                                }
                            }
                            new_info = {true_count: t, lie_count: l}
                            new_round_count += 1
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
                            'vote_result': result,
                            'end_condition_count': new_end_condition_count,
                            'round_count': new_round_count,
                            'turn_count': new_turn_count,
                            'info': new_info,
                            'answers': new_answers
                        })
                        this.setState({
                            voted: false
                        })
                    }
                })

            }
            else{
                if(this.state.voted === true){
                    game.child('current_votes').get().then((current_v) => {
                        let new_current_votes = current_v.val()
                        if(new_current_votes.length === this.state.players.length - 1){
                            new_current_votes = {}
                        }
                        new_current_votes[this.state.name] = this.state.current_vote
                        game.update({current_votes: new_current_votes})
                    })
                }

                this.setState({
                    votes: votes.val()
                })
            }
        })
    }

    renderPlayerList() {
        const answeringPlayer = this.state.players[this.state.current_player]

        return (
            <>
                <p className='playersLabel'>
                    Players:
                </p>
                <div className='playersList'>
                    {this.state.players.map((player) => {
                        return (
                            <li key={player}>
                                <div className={player === answeringPlayer ? 'currentPlayer' : undefined} >
                                    {player}
                                </div>
                            </li>
                        )
                    }
                    )}
                </div>
            </>
        )
    }

    renderWaitingRoom() {
        const hasEnoughPlayers = this.state.players.length >= MIN_NUMBER_PLAYERS
        const roomCode = window.location.pathname.substring(6, 13)
        const url = window.location.origin + '/enter/' + roomCode
        return (
            <div className='waiting'>
                <p className='linkLabel'>send your friends this link:</p>
                <p><a href={url} target="_blank" className='link' rel="noreferrer">{url}</a></p>
                {hasEnoughPlayers && <button className='block' onClick={this.startGame} style={{margin: 'auto'}}>start</button>}
                {!hasEnoughPlayers && <p>{MIN_NUMBER_PLAYERS - this.state.players.length} more players needed to start!</p>}
            </div>
        )
    }

    renderEndPage() {
        const end_info = this.state.info
        const truthTellersAutoWin = end_info.lie_count === 0
        return (
            <div>
                <div className='liarLabel'>
                    {truthTellersAutoWin && <>Saints win, and the loser is {this.state.liar} (the Devil!)</>}
                    {!truthTellersAutoWin && <div>
                        <br/>
                        Uh-oh, {end_info.lie_count} lies were voted as truths!
                        <br/>
                        Your final saving grace: vote (over zoom) who you think the Devil is.
                        <br/>
                        <br/>
                        <details>
                            <summary><strong>Toggle to show the Devil (don't click until everyone has voted!)</strong></summary>
                            <br/>
                            {this.state.liar} is the Devil!
                            <br/><br/>
                            If the majority voted correctly, the Saints win!
                            Otherwise, {this.state.liar} (the Devil) wins!
                            <br/><br/>
                            <button className='block' onClick={this.restartGame}>play again</button>
                        </details>
                    </div>}
                </div>
            </div>
        )
    }

    renderVotingLog() {
        const votes = this.state.answers?.slice(1).reverse()
        if (votes.length > 0)  {
            return (
                <div className='votingLog'>
                    <details open>
                        <summary className='playersLabel'>Voting log:</summary>
                        {votes.map((val, i) => {
                            const questionNum = votes.length - i
                            return (
                                <li key={i + 1}>
                                    Q{questionNum} by {val[0]} was voted as <b>{val[2]}</b>
                                </li>
                            )
                        })}
                    </details>
                </div>
            )
        }

        return <></>
    }

    renderPlayerIdentity() {
        if (this.isViewingMode()) return <></>
        const currentPlayerIsLiar = this.state.name === this.state.liar

        if (currentPlayerIsLiar) {
            return (
                <details className='playerIdentity linkLabel'>
                    <summary>You are the <u>Devil</u>.</summary><br/>
                    You must always lie when it is your turn to answer questions.
                    Try to trick the other players into thinking you are telling the truth,
                    without being detected as the Devil.
                </details>
            )
        }

        return (
            <details className='playerIdentity linkLabel'>
                <summary>You are a <u>Saint</u>.</summary><br/>
                You are trying to detect when other people are lying,
                and figure out who is the Devil.
            </details>
        )
    }

    renderCurrentQuestion() {
        const answeringPlayer = this.state.players[this.state.current_player]
        const currentQuestion = this.state.current_card.name
        const currentPlayer = this.state.name
        const currentPlayerIsLiar = this.state.name === this.state.liar

        return (
            <div>
                <p className='promptLabel'>Question {this.state.turn_count + 1} / {GAME_END_TURN_COUNT}</p>
                {currentPlayer !== answeringPlayer ? (
                    <p className='promptLabel'>{answeringPlayer} is answering the question '{currentQuestion}'</p>
                    ) : (
                    <>
                        <p className='promptLabel'>It's your turn to answer this question: <br/> {currentQuestion}</p>
                        <p className='promptLabel'>
                            God wants you to tell <span className='hl'>{this.state.current_card.val ? 'the truth' : 'a lie'}</span>.
                            As a <span className='hl'>{currentPlayerIsLiar ? 'Devil' : 'Saint'}</span>,
                            you must <span className='hl'>{currentPlayerIsLiar ? 'lie' : this.state.current_card.val ? 'tell the truth' : 'lie'}</span>.
                        </p>

                    </>
                    )
                }
            </div>
        )
    }

    renderVotingSection() {
        const answeringPlayer = this.state.players[this.state.current_player]
        if (this.state.name === answeringPlayer) {
            return (
                <div className='votingSection'>
                    Other players are currently voting on {this.isViewingMode() ? answeringPlayer + "'s": 'your'} ~ honesty ~ 😌😌😌
                </div>
            )
        }

        if (this.state.voted) {
            return (
                <div className='votingSection'>
                    You have voted!
                </div>
            )
        }

        return (
            <div className='votingSection'>
                <p className='promptLabel hl'>Do you think {answeringPlayer} was telling the truth or lying?</p>

                <div className='votingOptions'>
                    <button className='block' onClick={this.updateVoteTruth}>Telling the truth</button>
                    <button className='block' onClick={this.updateVoteLie}>Lying</button>
                </div>
            </div>
        )
    }

    renderPlayersHaveVotedSection() {
        if (!this.state.current_votes) { return <></> }
        return (
            <div>
                {Object.keys(this.state.current_votes).map((key, ind) => {
                    return (
                        <div className="linkLabel" key={ind}>
                            {key} voted {this.state.current_votes[key]}!
                        </div>
                        )
                    })
                }
            </div>
        )
    }

    renderRemainingLieVotes() {
        return (
            <div className='linkLabel'>
                The group can vote {LIE_DECK_END_COUNT - (this.state.lie_deck?.length || 0)} more answers as lies.
            </div>
        )
    }

    renderMainGamePage() {
        if (this.isViewingMode()) {
            return (
                <div>
                    {this.renderCurrentQuestion()}
                    {this.renderRemainingLieVotes()}
                    {this.renderPlayersHaveVotedSection()}
                </div>
            )
        }
        return (
            <div>
                {this.renderPlayerIdentity()}
                {this.renderCurrentQuestion()}
                {this.renderVotingSection()}
            </div>
        )
    }

    render() {
        return (
            <div className='gameScreen'>
                <div className='gameScreenLeft'>
                    {this.renderPlayerList()}
                    {this.state.stage === 1 && this.renderVotingLog()}
                </div>
                <div className='gameScreenRight'>
                    {this.state.stage === 0 && this.renderWaitingRoom()}
                    {this.state.stage === 1 && this.renderMainGamePage()}
                    {this.state.stage === 2 && this.renderEndPage()}
                </div>
            </div>
        );
    }
}

export default Room;
