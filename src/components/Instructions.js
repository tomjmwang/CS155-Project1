import React from 'react'
import { Link } from 'react-router-dom'

function Instructions() {
    return (
        <div className='root' style={{'font-size': '18px', fontWeight: 'bold', 'overflow': 'scroll'}}>
            <div className='container instructions' >
            <h1 style={{margin: 'auto', paddingTop: 60}}>How to play</h1>
            <p>Welcome to Heaven! Or so you think. Turns out, God has become pickier than before and now has a new rule for folks wanting to enter heaven: they must be able to tell when people are lying. In order to verify who does or does not belong in heaven with these new rules, everyone must participate in a group lie-detecting simulation.</p>

            <p>God will give each player a question, as well as an instruction of whether to tell the truth or lie (in order for the simulation to work, sometimes you will have to lie 😔 ). After each player answers, everyone else will vote on whether or not they think that player is telling the truth or lying. <u>Players can only vote a total of four answers as lies.</u> This continues until every player has answered two questions each.</p>

            <p>There is one catch: unbeknownst to God, one of the players is the Devil and is trying to bring everyone down to hell with them. They can only lie, regardless of what God tells them, and are trying to make the Saints fail their lie-detection test without being detected.</p>

            <p>After everyone has answered two questions, God will reveal if the players have mistakenly voted any of the lies as truths. If no lies were mistaken as truths, then everyone will go to heaven, and the Devil goes back to hell!</p>
            <p>If there were any lies mistaken as truths, however, the group still has one saving grace: if majority can identify who the Devil is, they can send the Devil back to hell and re-enter heaven. Otherwise, the Devil wins and will bring them all to hell.</p>

            <p>
            <details>
                <summary>Tips + tricks!</summary>
                <p><u>As a Saint</u>, try to detect when other people are lying and figure out who is the Devil. If God's will is for you to lie, try to make it obvious
                so your fellow saints can detect it!</p>

                <p><u>As a Devil</u>, you must always lie when answering questions. Try to trick the other players into thinking you are telling the truth,
                    without being detected!</p>
            </details>
            </p>

            <p>
            <a href='https://docs.google.com/document/d/1tKZH9MmeWXQc_eNcoHw3SsS-xuUpcVUN5S6INx_17vs/edit?usp=sharing' target="_blank" rel="noreferrer">
                You can read the full rules here &rarr;
            </a></p>
            <p><Link to='/' >&larr; back</Link></p>
        </div>
        </div>
    );
}

export default Instructions;
