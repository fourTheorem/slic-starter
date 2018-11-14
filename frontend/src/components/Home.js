import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router'

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
      </div>
    )
  }
}

Home.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
}

const mapStateToProps = ({ checklists: { loading } }) => ({
  loading
})

export default connect(mapStateToProps)(Home)
