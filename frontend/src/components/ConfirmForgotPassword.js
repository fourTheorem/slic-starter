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

class ConfirmForgotPassword extends Component {
  state = {
    email: this.props.auth.email,
    confirmationCode: '',
    newPassword: ''
  };

  validate = () => this.state.confirmationCode.length > 5;

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

    const errorItem = newPasswordError
      ? (
        <Grid item>
          <ErrorMessage messageId={newPasswordError.id} />
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
                />
              </Grid>

              <Grid item>
                <TextField
                  className={classes.input}
                  id="new-password"
                  label="New Password"
                  type="password"
                  pattern="(?=.*\d)(?=.*[^$*.[]{}()?!@#%/\,><':;|_~`=+-])(?=.*[a-z])(?=.*[A-Z]).{6,}"
                  autoComplete="new-password"
                  onChange={this.handleChange}
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
                  disabled={sendingNewPassword || !this.validate}
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
