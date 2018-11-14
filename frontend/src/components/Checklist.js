import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import {
  Card,
  CardActions,
  CardContent,
  Grid,
  IconButton,
  Typography
} from '@material-ui/core'
import { Delete } from '@material-ui/icons'
import { CircularProgress } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import Loading from './Loading'
import { removeList } from '../actions/checklists'
const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2
  }
})

class Checklist extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.list && !this.props.list) {
      // The list was deleted - go back home
      this.props.dispatch(push('/'))
    }
  }

  handleRemove = () => {
    const { dispatch, list } = this.props
    dispatch(removeList({ listId: list.listId }))
  }

  render() {
    const { removing, classes, list } = this.props

    return list ? (
      <Grid container layout="row" className={classes.root} justify="center">
        <Grid item xs={10} sm={8} md={4} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                {list.name}
              </Typography>
            </CardContent>
            <CardActions>
              {removing ? (
                <CircularProgress />
              ) : (
                <IconButton onClick={this.handleRemove}>
                  <Delete />
                </IconButton>
              )}
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    ) : (
      <Loading />
    )
  }
}

Checklist.propTypes = {
  removing: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  list: PropTypes.object
}

const makeMapStateToProps = (initialState, ownProps) => {
  console.log('ownProps', ownProps, initialState)
  const {
    match: {
      params: { id: listId }
    }
  } = ownProps
  return ({ checklists: { listsById, removing } }) => {
    const list = listId ? listsById[listId] : {}
    return {
      removing,
      list
    }
  }
}

export default connect(makeMapStateToProps)(withStyles(styles)(Checklist))
