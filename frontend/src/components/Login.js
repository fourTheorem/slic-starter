import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core'

import { connect } from 'react-redux'

import { logIn } from '../actions/auth'
import { messages } from '../errors'

const styles = theme => ({
  root: {
    background: 'linear-gradient(to left, #314755, #26a0da)',
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

class Login extends Component {
  state = {
    username: '',
    password: ''
  }

  validate = () =>
    this.state.username.length > 0 && this.state.password.length > 0

  handleChange = ({ target: { id, value } }) => this.setState({ [id]: value })

  handleSubmit = event => {
    event.preventDefault()
    const { dispatch } = this.props
    dispatch(logIn(this.state))
  }

  render() {
    const { classes } = this.props

    const { loggingIn, error } = this.props.auth

    const errorItem = error ? (
      <Grid item>
        <Typography className={classes.error}>{messages[error.id]}</Typography>
      </Grid>
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
                  id="username"
                  label="Email"
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item>
                <TextField
                  className={classes.input}
                  id="password"
                  label="Password"
                  type="password"
                  onChange={this.handleChange}
                />
              </Grid>
              {errorItem}
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  className={classes.button}
                  disabled={loggingIn || !this.validate()}
                >
                  {loggingIn ? 'Logging in...' : 'Log In'}
                </Button>
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
  dispatch: PropTypes.func.isRequired
}

const mapStateToProps = ({ auth }) => ({ auth })

export default connect(mapStateToProps)(withStyles(styles)(Login))
