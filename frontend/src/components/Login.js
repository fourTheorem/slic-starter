import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Redirect, Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core'

import ErrorMessage from './ErrorMessage'
import { logIn } from '../actions/auth'

const styles = (theme) => ({
  root: {
    background: 'linear-gradient(to right, #4A00E0, #8E2DE2)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '100%',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    minWidth: '300px',
    padding: theme.spacing.unit * 2,
  },
  input: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.unit,
  },
})

class Login extends Component {
  state = {
    email: '',
    password: '',
  }

  validate = () => this.state.email.length > 0 && this.state.password.length > 0

  handleChange = ({ target: { id, value } }) => this.setState({ [id]: value })

  handleSubmit = (event) => {
    event.preventDefault()
    this.props.dispatch(logIn(this.state))
  }

  render() {
    const {
      classes,
      auth: { userUnconfirmed },
    } = this.props

    const {
      loggingIn,
      loginError,
      authenticated,
      preAuthenticatedPath,
    } = this.props.auth

    const errorItem =
      !loggingIn && loginError ? (
        <Grid item>
          <ErrorMessage messageId={loginError.id} />
        </Grid>
      ) : null

    const signedIn = authenticated ? (
      <Redirect to={preAuthenticatedPath || '/'} />
    ) : null

    const unconfirmed = userUnconfirmed ? (
      <Redirect to="/confirm-signup" />
    ) : null

    return (
      <div className={classes.root}>
        <form onSubmit={this.handleSubmit}>
          <Paper className={classes.paper}>
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="stretch"
              spacing={8}
            >
              <Grid item>
                <Typography variant="h3">Log In</Typography>
              </Grid>
              <Grid item>
                <TextField
                  className={classes.input}
                  id="email"
                  label="Email"
                  autoComplete="username"
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item>
                <TextField
                  className={classes.input}
                  id="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  onChange={this.handleChange}
                />
              </Grid>
              {unconfirmed}
              {errorItem}
              {signedIn}

              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  id="login-btn"
                  className={classes.button}
                  disabled={loggingIn || !this.validate()}
                >
                  {loggingIn ? 'Logging in...' : 'Log In'}
                </Button>
              </Grid>
              <Grid item>
                <Typography>
                  Not registered? <Link to="/signup">Sign up here</Link>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </form>
      </div>
    )
  }
}

Login.propTypes = {
  auth: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
}

const mapStateToProps = ({ auth }) => ({ auth })

export default connect(mapStateToProps)(withStyles(styles)(Login))
