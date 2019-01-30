import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { NavLink } from 'react-router-dom'

const styles = {
  root: {
    flexGrow: 1
  }
}

function MenuBar(props) {
  const { classes } = props

  return (
    <div className="logged-out-menuBar">
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h5" color="inherit">
            <NavLink
              to="/"
              style={{ textDecoration: 'none' }}
              activeStyle={{ color: 'black' }}
            >
              {' '}
              SLIC Starter
            </NavLink>
          </Typography>
          <ul>
            <li>
              <NavLink
                to="/login"
                style={{ textDecoration: 'none', marginLeft: '100px' }}
                activeStyle={{ color: 'black' }}
                className="MenuLink1"
              >
                <Typography variant="h6">Login</Typography>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/signup"
                style={{ textDecoration: 'none', marginLeft: '115px' }}
                activeStyle={{ color: 'black' }}
                className="MenuLink2"
              >
                <Typography variant="h6">Signup</Typography>
              </NavLink>
            </li>
          </ul>
        </Toolbar>
      </AppBar>
    </div>
  )
}

MenuBar.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(MenuBar)
