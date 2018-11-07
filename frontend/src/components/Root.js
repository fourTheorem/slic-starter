import React, { Component } from 'react'

import { Route, Switch } from 'react-router'

import Home from './Home'
import Login from './Login'

export default class Root extends Component {
  render() {
    return (
      <Route>
        <Switch>
          <Route path="/" component={Home} />
          <Route exact path="/login" component={Login} />
        </Switch>
      </Route>
    )
  }
}
