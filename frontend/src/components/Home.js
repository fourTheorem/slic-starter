import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router'
import { Redirect } from 'react-router-dom'

import Checklist from './Checklist'
import NavigationBar from './NavigationBar'
import Lists from './Lists'
import Loading from './Loading'
import EditChecklist from './EditChecklist'
import AcceptShare from './AcceptShare'

import { loadLists } from '../actions/checklists'
import { setPreAuthenticatedPath } from '../actions/auth'

class Home extends Component {
  componentDidMount() {
    if (this.props.auth.authenticated) {
      this.props.dispatch(loadLists())
    }
  }

  render() {
    const {
      auth: { authenticated, preAuthenticatedPath },
      dispatch,
      loading,
    } = this.props

    let authCheck = null
    const { pathname } = this.props.location
    if (!authenticated && preAuthenticatedPath !== pathname) {
      dispatch(setPreAuthenticatedPath(pathname))
      authCheck = <Redirect to="/login" />
    }

    const body = loading ? (
      <Loading />
    ) : (
      <Switch>
        <Route exact path="/new-list" component={EditChecklist} />
        <Route exact path="/list/:id" component={Checklist} />
        <Route path="/list/:id/edit" component={EditChecklist} />
        <Route path="/invitation/:code" component={AcceptShare} />
        <Route path="/" component={Lists} />
      </Switch>
    )

    return (
      <div style={{ height: '100%', overflowX: 'hidden' }}>
        <NavigationBar />
        {body}
        {authCheck}
      </div>
    )
  }
}

Home.propTypes = {
  auth: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
}

const mapStateToProps = ({ checklists: { loading }, auth }) => ({
  loading,
  auth,
})

export default connect(mapStateToProps)(Home)
