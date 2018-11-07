import React, { Component } from 'react'

import { Route, Switch } from 'react-router'

import Home from './Home'
import Login from './Login'

export default class Root extends Component {
  render() {
    return (
      <Route>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route path="/" component={Home} />
        </Switch>
      </Route>
    )
  }
}
