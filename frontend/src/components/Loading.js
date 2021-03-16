import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import { CircularProgress, Grid, Typography } from '@material-ui/core'

const styles = (theme) => ({
  root: {
    height: '100%',
  },
})

class Loading extends Component {
  render() {
    const { classes, label } = this.props
    return (
      <Grid
        container
        className={classes.root}
        direction="column"
        alignItems="center"
        justify="center"
      >
        <Grid item>
          <CircularProgress className="spinner" />
        </Grid>
        <Grid item>{label ? <Typography>{label}</Typography> : null}</Grid>
      </Grid>
    )
  }
}

Loading.propTypes = {
  classes: PropTypes.object.isRequired,
  label: PropTypes.string,
}

export default withStyles(styles)(Loading)
