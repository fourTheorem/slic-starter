import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { withRouter, Route, Switch } from 'react-router'

import Home from './Home'
import Loading from './Loading'
import Login from './Login'
import Signup from './Signup'

import { checkAuthentication } from '../actions/auth'
import ConfirmSignup from './ConfirmSignup'

class Root extends Component {
  componentDidMount() {
    this.props.dispatch(checkAuthentication())
  }

  render() {
    const { authenticated } = this.props

    if (typeof authenticated === 'undefined') {
      return <Loading />
    }

    return (
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/confirm-signup" component={ConfirmSignup} />
        <Route path="/" component={Home} />
      </Switch>
    )
  }
}

Root.propTypes = {
  authenticated: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
}

const mapStateToProps = ({ auth: { authenticated } }) => ({
  authenticated,
})

export default withRouter(connect(mapStateToProps)(Root))
