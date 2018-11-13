import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Grid, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import ListSummary from './ListSummary'

const styles = theme => ({
  padded: {
    padding: theme.spacing.unit * 2
  }
})

class Lists extends Component {
  render() {
    const { classes, listIds } = this.props

    if (listIds.length === 0) {
      return <Typography>No lists</Typography>
    }

    return (
      <Grid container layout="row" spacing={16} className={classes.padded}>
        {listIds.map(listId => (
          <Grid item key={listId} xl={3} lg={4} md={6} xs={12}>
            <ListSummary listId={listId} />
          </Grid>
        ))}
      </Grid>
    )
  }
}

Lists.propTypes = {
  classes: PropTypes.object.isRequired,
  listIds: PropTypes.array.isRequired
}

const mapStateToProps = ({ checklists: { listIds } }) => ({
  listIds
})

export default connect(mapStateToProps)(withStyles(styles)(Lists))
