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
                    <h1>☁️☁️😇😇😈😇☁️☁️ <br/> Devil Among Us <br/>🔥🔥🔥🔥🔥🔥🔥🔥 </h1>
                    <h2 className='subheader'>Detect lies as if your (after) life depends on it
                        <br/><br/>
                        <Link to='/instructions'>How to play &rarr;</Link>
                    </h2>
                    <Link to='/enter'><button className='block'>create new room</button></Link>
                    <input className='usernameInput' type='text' value={this.state.code} onChange={this.handleChange.bind(this)} />
                    <Link to={'/enter/' + this.state.code} style={{ textDecoration: 'none' }}><button className='block'>enter with code</button></Link>
                </div>
            </div>
        );
    }
}
export default Home;
