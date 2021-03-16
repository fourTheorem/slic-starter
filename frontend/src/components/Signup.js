import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import ErrorMessage from './ErrorMessage'
import { signUp } from '../actions/auth'

const styles = (theme) => ({
  root: {
    background: 'linear-gradient(to right, #1fa2ff, #12d8fa, #a6ffcb)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '100%',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    minWidth: '340px',
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

class Signup extends Component {
  state = {
    email: '',
    password: '',
  }

  validate = () => this.state.email.length > 0 && this.state.password.length > 5

  handleChange = ({ target: { id, value } }) => this.setState({ [id]: value })

  handleSubmit = (event) => {
    event.preventDefault()
    this.props.dispatch(signUp(this.state))
  }

  render() {
    const { classes } = this.props

    const { signingUp, signupError, signedUp, userConfirmed } = this.props.auth

    const errorItem = signupError ? (
      <Grid item>
        <Typography className={classes.error}>
          <ErrorMessage messageId={signupError.id} />
        </Typography>
      </Grid>
    ) : null

    const confirmSection =
      signedUp && !userConfirmed ? <Redirect to="/confirm-signup" /> : null

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
                <Typography variant="h3">Sign Up</Typography>
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
                  autoComplete="new-password"
                  onChange={this.handleChange}
                />
              </Grid>
              {errorItem}
              <Grid item>
                <Button
                  id="signup-btn"
                  variant="contained"
                  color="secondary"
                  type="submit"
                  className={classes.button}
                  disabled={signingUp || !this.validate()}
                >
                  {signingUp ? 'Signing up...' : 'Sign Up'}
                </Button>
              </Grid>
              <Grid item>
                {confirmSection}
                <Typography>
                  Already registered? <Link to="/login">Log in here</Link>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </form>
      </div>
    )
  }
}

Signup.propTypes = {
  auth: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
}

const mapStateToProps = ({ auth }) => ({ auth })

export default connect(mapStateToProps)(withStyles(styles)(Signup))
