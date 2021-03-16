import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  AppBar,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { ArrowBack } from '@material-ui/icons'

import { logOut } from '../actions/auth'

const styles = {
  grow: {
    flexGrow: 1,
  },
  backButton: {
    marginLeft: -12,
    marginRight: 20,
  },
}

class NavigationBar extends Component {
  handleLogout = () => {
    this.props.dispatch(logOut())
  }

  render() {
    const { classes, titles } = this.props

    const backIcon =
      titles.length > 1 ? (
        <IconButton
          color="inherit"
          className={classes.backButton}
          component={Link}
          to="/"
        >
          <ArrowBack />
        </IconButton>
      ) : null

    return (
      <AppBar position="sticky">
        <Toolbar>
          {backIcon}
          <Typography variant="h6" color="inherit" className={classes.grow}>
            {titles.join(' > ')}
          </Typography>
          <Button color="inherit" onClick={this.handleLogout} id="logout-btn">
            Log Out
          </Button>
        </Toolbar>
      </AppBar>
    )
  }
}

NavigationBar.propTypes = {
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  titles: PropTypes.array.isRequired,
}

const mapStateToProps = ({ app: { titles } }) => ({
  titles,
})

export default connect(mapStateToProps)(withStyles(styles)(NavigationBar))
