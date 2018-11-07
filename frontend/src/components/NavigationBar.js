import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles'
import { AppBar, Button, Toolbar, Typography } from '@material-ui/core'

import { connect } from 'react-redux'

const styles = {
  grow: {
    flexGrow: 1
  }
}

class NavigationBar extends Component {
  render() {
    const { classes } = this.props

    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit" className={classes.grow}>
            SLIC Starter
          </Typography>
          <Button color="inherit" component={Link} to="/login">
            Log In
          </Button>
        </Toolbar>
      </AppBar>
    )
  }
}

NavigationBar.propTypes = {
  classes: PropTypes.object.isRequired
}

const mapStateToProps = () => ({})

export default connect(mapStateToProps)(withStyles(styles)(NavigationBar))
