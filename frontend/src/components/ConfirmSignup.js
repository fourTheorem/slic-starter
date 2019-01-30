import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { confirmSignup } from '../actions/auth'
import { messages } from '../errors'
import MenuBar from './menuBar'
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styling = theme => ({
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
    minWidth: '300px',
    padding: theme.spacing.unit * 2
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

  handleChange = ({ target: { id, value } }) => this.setState({ [id]: value })

  handleSubmit = event => {
    event.preventDefault()
    this.props.dispatch(
      confirmSignup(this.state.email, this.state.confirmationCode)
    )
  }

  render() {
    const classes = this.props

    const {
      confirmingSignup,
      confirmationError,
      signupConfirmed
    } = this.props.auth

    const confirmed = signupConfirmed ? <Redirect to="/login" /> : null

    console.log('ConfirmSignup props', this.props)

    const errorItem = confirmationError ? (
      <Grid item>
        <Typography>{messages[confirmationError.id]}</Typography>
      </Grid>
    ) : null

    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="stretch"
            spacing={8}
          >
            <Grid item>
              <Typography variant="h2">Confirmation Code</Typography>
            </Grid>

            <Typography variant="h4">{this.props.auth.email}</Typography>

            <form onSubmit={this.handleSubmit}>
              <Grid item>
                <TextField
                  id="confirmationCode"
                  label="Confirmation Code"
                  onChange={this.handleChange}
                  className={classes.input}
                />
              </Grid>

              <Grid item>
                <Button
                  vavriant="contained"
                  color="secondary"
                  type="submit"
                  className={classes.button}
                  disabled={confirmingSignup}
                >
                  Confirm Account
                </Button>
              </Grid>
            </form>
            {errorItem}
            {confirmed}
          </Grid>
        </Paper>
      </div>
    )
  }
}

ConfirmSignup.propTypes = {
  auth: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

const mapStateToProps = ({ auth }) => ({ auth })

export default connect(mapStateToProps)(withStyles(styling)(ConfirmSignup))
