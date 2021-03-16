import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import ErrorMessage from './ErrorMessage'
import { confirmSignup } from '../actions/auth'
import { resendConfirmationCode } from '../actions/auth'

const style = (theme) => ({
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
    alignItems: 'center',
    minWidth: '460px',
    padding: theme.spacing.unit * 2,
  },
  input: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.unit,
  },
  success: {
    color: 'green',
  },
})

class ConfirmSignup extends Component {
  state = {
    email: this.props.auth.email,
    confirmationCode: '',
  }

  validate = () => this.state.confirmationCode.length > 5

  handleChange = ({ target: { id, value } }) => this.setState({ [id]: value })

  resendConfirmation = (event) => {
    event.preventDefault()
    this.props.dispatch(resendConfirmationCode(this.state.email))
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.props.dispatch(
      confirmSignup(this.state.email, this.state.confirmationCode)
    )
  }

  render() {
    const { classes } = this.props
    const {
      confirmingSignup,
      confirmationError,
      signupConfirmed,
      codeSent,
    } = this.props.auth

    const codeResent = codeSent ? (
      <Grid item>
        <Typography className={classes.success}>
          Code successfully sent!
        </Typography>
      </Grid>
    ) : null

    const noEmail = !this.state.email ? <Redirect to="/login" /> : null

    const signupSuccess = signupConfirmed ? <Redirect to="/login" /> : null

    const errorItem = confirmationError ? (
      <Grid item>
        <ErrorMessage messageId={confirmationError.id} />
      </Grid>
    ) : null

    return (
      <div className={classes.root}>
        <form onSubmit={this.handleSubmit}>
          <Paper className={classes.paper}>
            <Grid
              className={classes.input}
              container
              direction="column"
              justify="center"
              alignItems="stretch"
              spacing={8}
            >
              <Grid item>
                <Typography variant="h4">Enter Confirmation Code</Typography>
              </Grid>

              <Grid item>
                <Typography>
                  The code was sent by email to: <br />
                  {this.state.email}
                </Typography>
              </Grid>

              <Grid item>
                <TextField
                  id="confirmationCode"
                  label="Confirmation Code"
                  onChange={this.handleChange}
                  className={classes.input}
                />
              </Grid>

              <Grid item>
                {errorItem}
                {noEmail}
                {signupSuccess}
                {codeResent}
              </Grid>

              <Grid
                item
                container
                layout="row"
                justify="flex-end"
                alignItems="center"
              >
                <Grid item>
                  <Button
                    id="resend-code-btn"
                    className={classes.button}
                    onClick={this.resendConfirmation}
                    disabled={!this.state.email}
                  >
                    Resend Code
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    vavriant="contained"
                    color="secondary"
                    type="submit"
                    id="confirm-signup-btn"
                    className={classes.button}
                    disabled={
                      confirmingSignup || !this.validate() || !this.state.email
                    }
                  >
                    {confirmingSignup ? 'Confirming...' : 'Confirm'}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </form>
      </div>
    )
  }
}

ConfirmSignup.propTypes = {
  auth: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
}

const mapStateToProps = ({ auth }) => ({ auth })

export default connect(mapStateToProps)(withStyles(style)(ConfirmSignup))
