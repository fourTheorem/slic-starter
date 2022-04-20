import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core'
import { Redirect, Link } from 'react-router-dom'
import { connect } from 'react-redux'

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
    justifyContent: 'center'
  },
  paper: {
    minWidth: '340px',
    maxWidth: '500px',
    padding: theme.spacing.unit * 2
  },
  title: {
    whiteSpace: 'nowrap'
  },
  input: {
    width: '100%'
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.unit
  },
  helperText: {
    maxWidth: '275px'
  }
})

/**
 * TODO: Update this regular expression to check _exactly_ the password policy enforced by the Cognito User Pool
 */
const PASSWORD_REGEX = /\w{12,}/

class Signup extends Component {
  state = {
    email: '',
    password: ''
  };

  validate = () => {
    const emailValid = this.state.email.length > 3
    const passwordValid = PASSWORD_REGEX.test(this.state.password)

    const result = {
      valid: emailValid && passwordValid
    }

    // Only provide field-specific errors if a value has been entered.
    // We do not want to show any error if the user hasn't started typing yet
    result.email = {
      showError: !emailValid && this.state.email.length > 0
    }
    result.password = {
      showError: !passwordValid && this.state.password.length > 0
    }
    if (result.email.showError) {
      result.email.message = 'Email is required'
    }
    if (result.password.showError) {
      result.password.message = 'Password must contain at least one number, a special character, one lowercase and uppercase letter, and at least 6 characters'
    }

    return result
  }

  handleChange = ({ target: { id, value } }) => this.setState({ [id]: value });

  handleSubmit = (event) => {
    event.preventDefault()
    this.props.dispatch(signUp(this.state))
  };

  render () {
    const { classes } = this.props

    const { signingUp, signupError, signedUp, userConfirmed } = this.props.auth

    // Perform client-side validation
    const validation = this.validate()

    // Render component for server-side errors if present
    const errorItem = signupError
      ? (
        <Grid item>
          <Typography className={classes.error}>
            <ErrorMessage messageId={signupError.id} />
          </Typography>
        </Grid>
        )
      : null

    const confirmSection =
      signedUp && !userConfirmed ? <Redirect to="/confirm-signup" /> : null

    return (
      <div className={classes.root}>
        <form onSubmit={this.handleSubmit}>
          <Paper className={classes.paper}>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="stretch"
              spacing={8}
            >
              <Grid item>
                <Typography variant="h3" className={classes.title}>Sign Up</Typography>
              </Grid>
              <Grid item>
                <TextField
                  className={classes.input}
                  id="email"
                  label="Email"
                  autoComplete="username"
                  onChange={this.handleChange}
                  error={validation.email.showError}
                  helperText={validation.email.message}
                  FormHelperTextProps={{
                    classes: {
                      root: classes.helperText
                    }
                  }}
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
                  error={validation.password.showError}
                  helperText={validation.password.message}
                  FormHelperTextProps={{
                    classes: {
                      root: classes.helperText
                    }
                  }}
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
                  disabled={signingUp || !validation.valid}
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
  dispatch: PropTypes.func.isRequired
}

const mapStateToProps = ({ auth }) => ({ auth })

export default connect(mapStateToProps)(withStyles(styles)(Signup))
