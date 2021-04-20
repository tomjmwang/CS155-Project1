import React from 'react'
import { Link } from 'react-router-dom'
class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            code: ""
        }
    }

    handleChange(val){
        this.setState({code: val.target.value})
    }

    render() {
        return (
            <div className='root'>
                <div className='container'>
                    <h1>🔥🔥🔥 Fire the Liar 🤥🤥🤥</h1>
                    <h3 className='subheader'>A game of getting to know each other (or for some, <em>not</em> getting to know each other)!
                        <br></br>
                        <a href='https://docs.google.com/document/d/1tKZH9MmeWXQc_eNcoHw3SsS-xuUpcVUN5S6INx_17vs/edit?usp=sharing' target="_blank">
                            How to play &rarr;
                        </a>
                    </h3>
                    <Link to='/enter'><button className='block'>create new room</button></Link>
                    <input className='usernameInput' type='text' value={this.state.code} onChange={this.handleChange.bind(this)} />
                    <Link to={'/enter/' + this.state.code} style={{ textDecoration: 'none' }}><button className='block'>enter with code</button></Link>
                </div>
            </div>
        );
    }
}
export default Home;
