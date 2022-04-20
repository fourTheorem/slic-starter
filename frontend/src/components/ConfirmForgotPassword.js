import { withStyles } from '@material-ui/core/styles'
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { forgotPasswordSubmit, forgotPassword } from '../actions/auth'
import { Redirect } from 'react-router-dom'
import ErrorMessage from './ErrorMessage'

const styles = (theme) => ({
  root: {
    background: 'linear-gradient(to right, #5e60ce, #5390d9)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '100%',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paper: {
    minWidth: '340px',
    whiteSpace: 'nowrap',
    padding: theme.spacing.unit * 2
  },
  input: {
    width: '100%'
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.unit
  }
})
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[\^$*.\[\]{}\(\)?\-\"!@#%&\/,><\':;|_~``=+-])(?=.*[a-z])(?=.*[A-Z]).{6,99}$/

class ConfirmForgotPassword extends Component {
  state = {
    email: this.props.auth.email,
    confirmationCode: '',
    newPassword: ''
  };

  validate = () => {
    const codeSent = this.state.confirmationCode.length > 5
    const newPasswordValid = PASSWORD_REGEX.test(this.state.newPassword)

    const result = {
      valid: codeSent && newPasswordValid
    }

    result.confirmationCode = {
      showError: !codeSent && this.state.confirmationCode.length > 0
    }
    result.newPassword = {
      showError: !newPasswordValid && this.state.newPassword.length > 0
    }
    if (result.confirmationCode.showError) {
      result.confirmationCode.message = 'Confirmation code is required'
    }
    if (result.newPassword.showError) {
      result.newPassword.message = 'Password must contain at least one number, a special character, one lowercase and uppercase letter, and at least 6 characters'
    }
    return result
  }

  handleChange = ({ target: { id, value } }) => {
    switch (id) {
      case 'confirmation-code':
        this.setState({ confirmationCode: value })
        break
      case 'new-password':
        this.setState({ newPassword: value })
        break
      default:
        this.setState({ [id]: value })
    }
  }

  resendCodeConfirmation = (event) => {
    event.preventDefault()
    this.props.dispatch(forgotPassword(this.state.email))
  };

  handleSubmit = (event) => {
    event.preventDefault()
    this.props.dispatch(forgotPasswordSubmit(this.state.email, this.state.confirmationCode, this.state.newPassword))
  };

  render () {
    const { classes } = this.props

    const { sendingNewPassword, newPasswordError, newPasswordSent } = this.props.auth

    const sendingPasswordSucccess = newPasswordSent ? (<Redirect to="/login" />) : null

    const validation = this.validate()

    const errorItem = newPasswordError
      ? (
        <Grid item>
          <Typography className={classes.error}>
            <ErrorMessage messageId={newPasswordError.id} />
          </Typography>
        </Grid>
        )
      : null

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
                <Typography variant="h4">Choose a New Password</Typography>
              </Grid>

              <Grid item>
                <Typography>
                  The code was sent by email to: <br />
                  {this.state.email}
                </Typography>
              </Grid>

              <Grid item>
                <TextField
                  id="confirmation-code"
                  label="Confirmation Code"
                  onChange={this.handleChange}
                  className={classes.input}
                  error={validation.confirmationCode.showError}
                  helperText={validation.confirmationCode.message}
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
                  id="new-password"
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  onChange={this.handleChange}
                  error={validation.newPassword.showError}
                  helperText={validation.newPassword.message}
                  FormHelperTextProps={{
                    classes: {
                      root: classes.helperText
                    }
                  }}
                />
                {errorItem}
                {sendingPasswordSucccess}
              </Grid>
              <Grid item>
                <Button
                  id="resend-code-btn"
                  className={classes.button}
                  onClick={this.resendCodeConfirmation}
                  disabled={!this.state.email}
                >
                  Resend Code
                </Button>
              </Grid>
              <Grid item>
                <Button
                  ariant="contained"
                  color="secondary"
                  type="submit"
                  id='confirm-password-btn'
                  className={classes.button}
                  disabled={sendingNewPassword || !validation.valid}
                >
                  {sendingNewPassword ? 'Resetting password...' : 'Reset Password'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </form>
      </div>
    )
  }
}

ConfirmForgotPassword.propTypes = {
  auth: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

const mapStateToProps = ({ auth }) => ({ auth })

export default connect(mapStateToProps)(withStyles(styles)(ConfirmForgotPassword))
