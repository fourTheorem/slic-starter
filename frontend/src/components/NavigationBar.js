import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { AppBar, Button, Toolbar, Typography } from '@material-ui/core'

import { logOut } from '../actions/auth'

const styles = {
  grow: {
    flexGrow: 1
  }
}

class NavigationBar extends Component {
  handleLogout = () => {
    this.props.dispatch(logOut())
  }

  render() {
    const { classes, titles } = this.props

    return (
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" color="inherit" className={classes.grow}>
            {titles.join(' > ')}
          </Typography>
          <Button color="inherit" onClick={this.handleLogout}>
            Log Out
          </Button>
        </Toolbar>
      </AppBar>
    )
  }
}

NavigationBar.propTypes = {
  classes: PropTypes.object.isRequired,
  titles: PropTypes.array.isRequired
}

const mapStateToProps = ({ app: { titles } }) => ({
  titles
})

export default connect(mapStateToProps)(withStyles(styles)(NavigationBar))
