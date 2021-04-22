import React from 'react'
import { Link } from 'react-router-dom'

function Instructions() {
    return (
        <div className='root' style={{'font-size': '18px', 'overflow': 'scroll'}}>
            <div className='container' >
            <h1>how to play</h1>
            <p>Welcome to heaven! Or so you think. Turns out, God has become pickier than before and now has a new rule for folks wanting to enter heaven: they must be able to tell when people are lying.</p>

            <p>In order to verify who does or does not belong in heaven with these new rules, everyone must participate in a group lie-detecting simulation. God will give each player a question, as well as an instruction of whether to tell the truth or lie. After each player answers, everyone else will vote on whether or not they think that player is telling the truth or lying. Players can only vote a total of four answers as lies. This continues until every player has answered two questions each.</p>

            <p>There is one catch: one person in the group is from the Devil and is trying to bring everyone down to hell with them. They can only lie, regardless of what God tells them, but they will try to trick everyone else into thinking they are telling the truth.</p>

            <p>After everyone has answered two questions, God will reveal if the players have mistakenly voted any of the lies as truths. If no lies were mistaken as truths, then everyone will go to heaven, and the Devil goes back to hell! If there were any lies mistaken as truths, however, the group still has one saving grace: if they correctly vote who the Devil is, they can send the Devil back to hell and re-enter heaven. Otherwise, the Devil wins and will bring them all to hell.</p>

            <a href='https://docs.google.com/document/d/1tKZH9MmeWXQc_eNcoHw3SsS-xuUpcVUN5S6INx_17vs/edit?usp=sharing' target="_blank">
                You can read the full rules here &rarr;
            </a>
            <Link to='/' style={{ textDecoration: 'none' }}><button className='block' style={{ marginTop: '30px', marginLeft: 'auto', marginRight: 'auto' }}>back</button></Link>
        </div>
        </div>
    );
}

export default Instructions;
