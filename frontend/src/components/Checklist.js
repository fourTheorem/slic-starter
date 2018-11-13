import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Card, CardContent, Grid, Paper, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2
  }
})

class Checklist extends Component {
  render() {
    const { classes, list } = this.props

    return (
      <Grid container layout="row" className={classes.root} justify="center">
        <Grid item xs={10} sm={8} md={4} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                {list.name || 'New List'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }
}

Checklist.propTypes = {
  classes: PropTypes.object.isRequired,
  list: PropTypes.object.isRequired
}

const makeMapStateToProps = (initialState, ownProps) => {
  const { listId } = ownProps
  return ({ checklists: { listsById } }) => {
    const list = listId ? listsById[listId] : {}
    return {
      list
    }
  }
}

export default connect(makeMapStateToProps)(withStyles(styles)(Checklist))
