import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { withRouter, Redirect, Route, Switch } from 'react-router'

import Home from './Home'
import Login from './Login'
import { checkAuthentication } from '../actions/auth'

class Root extends Component {
  componentDidMount() {
    this.props.dispatch(checkAuthentication())
  }

  render() {
    const {
      authenticated,
      history: { location }
    } = this.props
    return (
      <React.Fragment>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route path="/" component={Home} />
        </Switch>
        {location.pathname === '/login' && authenticated ? (
          <Redirect to="/" />
        ) : null}
        {location.pathname !== '/login' && authenticated === false ? (
          <Redirect to="/login" />
        ) : null}
      </React.Fragment>
    )
  }
}

Root.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
}

const mapStateToProps = ({ auth: { authenticated } }) => ({
  authenticated
})

export default withRouter(connect(mapStateToProps)(Root))
