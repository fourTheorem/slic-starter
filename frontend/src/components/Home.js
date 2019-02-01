import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router'
import { Redirect } from 'react-router-dom'

import Checklist from './Checklist'
import NewList from './NewList'
import NavigationBar from './NavigationBar'
import Lists from './Lists'
import Loading from './Loading'

import { loadLists } from '../actions/checklists'

class Home extends Component {
  componentDidMount() {
    this.props.dispatch(loadLists())
  }

  render() {
    const { loading } = this.props

    const { authenticated } = this.props.auth

    const authCheck = !authenticated ? <Redirect to="/login" /> : null

    const body = loading ? (
      <Loading />
    ) : (
      <Switch>
        <Route exact path="/new-list" component={NewList} />
        <Route exact path="/list/:id" component={Checklist} />
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
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = ({ checklists: { loading }, auth }) => ({
  loading,
  auth
})

export default connect(mapStateToProps)(Home)
