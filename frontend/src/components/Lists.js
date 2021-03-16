import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Fab, Grid, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { Add } from '@material-ui/icons'

import ListSummary from './ListSummary'

const styles = (theme) => ({
  padded: {
    padding: theme.spacing(2),
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },
})

class Lists extends Component {
  render() {
    const { classes, listIds } = this.props

    const body =
      listIds.length === 0 ? (
        <Typography variant="subtitle1">
          You don't have any lists. Click the button to create one!
        </Typography>
      ) : (
        listIds.map((listId) => (
          <Grid item key={listId} xl={3} lg={4} md={6} xs={12}>
            <ListSummary listId={listId} />
          </Grid>
        ))
      )
    return (
      <React.Fragment>
        <Grid
          container
          layout="row"
          className={classes.padded}
          justify="flex-start"
          alignItems="flex-start"
        >
          {body}
        </Grid>
        <Fab
          className={classes.fab}
          color="primary"
          component={Link}
          to="/new-list"
          id="new-list-button"
        >
          <Add />
        </Fab>
      </React.Fragment>
    )
  }
}

Lists.propTypes = {
  classes: PropTypes.object.isRequired,
  listIds: PropTypes.array.isRequired,
}

const mapStateToProps = ({ checklists: { listIds } }) => ({
  listIds,
})

export default connect(mapStateToProps)(withStyles(styles)(Lists))
