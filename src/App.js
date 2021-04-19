import React, { Component } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import Home from './components/Home'
import Instructions from './components/Instructions'
import Acknowledgements from './components/Acknowledgements'
import EnterUsername from './components/Enter-username'
import Room from './components/Room'
import './components/Components.css'

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={ props => <Home {...props} />} />
        <Route exact path="/instructions" render={ props => <Instructions {...props} />} />
        <Route exact path="/acknowledgements" render={ props => <Acknowledgements {...props} />} />
        <Route exact path="/enter" render={ props => <EnterUsername {...props} />} />
        <Route exact path="/enter/:id" render={ props => <EnterUsername {...props} />} />
        <Route exact path="/room/:id" render={ props => <Room {...props} />} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
