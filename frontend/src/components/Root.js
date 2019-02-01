import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { withRouter, Route, Switch } from 'react-router'

import Home from './Home'
import Login from './Login'
import Signup from './Signup'

import { checkAuthentication } from '../actions/auth'
import ConfirmSignup from './ConfirmSignup'

class Root extends Component {
  componentDidMount() {
    this.props.dispatch(checkAuthentication())
  }

  render() {
    const {
      history: { location }
    } = this.props

    switch (location.pathname) {
      case '/login':
      case '/signup':
        break

      default:
      // !authenticated ?(<Redirect to="/login" /> ):null
    }

    return (
      <React.Fragment>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/ConfirmSignup" component={ConfirmSignup} />
          <Route path="/" component={Home} />
        </Switch>
      </React.Fragment>
    )
  }
}

Root.propTypes = {
  authenticated: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
}

const mapStateToProps = ({ auth: { authenticated } }) => ({
  authenticated
})

export default withRouter(connect(mapStateToProps)(Root))
