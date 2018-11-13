import React, { Component } from 'react'
import { Route, Switch } from 'react-router'

import Checklist from './Checklist'
import NewList from './NewList'
import NavigationBar from './NavigationBar'
import Lists from './Lists'

export default class Home extends Component {
  render() {
    return (
      <div style={{ height: 'calc(100% - 64px)' }}>
        <NavigationBar />
        <Switch>
          <Route exact path="/new-list" component={NewList} />
          <Route exact path="/list/:id" component={Checklist} />
          <Route path="/" component={Lists} />
        </Switch>
      </div>
    )
  }
}
