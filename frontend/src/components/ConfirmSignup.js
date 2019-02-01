import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { confirmSignup } from '../actions/auth'
import { messages } from '../errors'
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { resendConfirmationCode } from '../actions/auth'
import { Link } from 'react-router-dom'

const style = theme => ({
  root: {
    background: 'linear-gradient(to right, #4A00E0, #8E2DE2)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '100%',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paper: {
    alignItems: 'center',
    minWidth: '600px',
    padding: theme.spacing.unit * 2,
    minHeight: '300px'
  },
  input: {
    width: '100%'
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.unit
  },
  error: {
    color: theme.palette.error.main
  }
})

class ConfirmSignup extends Component {
  state = {
    email: this.props.auth.email,
    confirmationCode: ''
  }

  validate = () => this.state.confirmationCode.length > 5

  handleChange = ({ target: { id, value } }) => this.setState({ [id]: value })

  // const email

  /* if(this.props.auth.email.length > 0){

    email = this.props.email
    }else{
      email = this.props.auth.confirmationEmail
}
 */

  resendConfirmation = event => {
    event.preventDefault()
    this.props.dispatch(resendConfirmationCode(this.state.email))
  }

  handleSubmit = event => {
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
      signupConfirmed
    } = this.props.auth

    const confirmed = signupConfirmed ? <Redirect to="/login" /> : null

    const noEmail = !this.state.email ? (
      <Grid item>
        <Typography className={classes.error}>
          No email specified, Try logging in again
          <br />
          <Link to="/login">Go to Login</Link>
        </Typography>
      </Grid>
    ) : null

    const errorItem = confirmationError ? (
      <Grid item>
        <Typography className={classes.error}>
          {messages[confirmationError.id]}
        </Typography>
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
              </Grid>
              <Grid item>
                <Button
                  vavriant="contained"
                  color="secondary"
                  type="submit"
                  className={classes.button}
                  disabled={
                    confirmingSignup || !this.validate() || !this.state.email
                  }
                >
                  {confirmingSignup ? 'Confirming...' : 'Confirm'}
                </Button>
              </Grid>
              <Grid item>{confirmed}</Grid>
            </Grid>
          </Paper>
        </form>
        <form onSubmit={this.resendConfirmation}>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              className={classes.button}
              disabled={!this.state.email}
            >
              Resend Code
            </Button>
          </Grid>
        </form>
      </div>
    )
  }
}

ConfirmSignup.propTypes = {
  auth: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
}

const mapStateToProps = ({ auth }) => ({ auth })

export default connect(mapStateToProps)(withStyles(style)(ConfirmSignup))
