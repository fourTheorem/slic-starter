import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Grid, Paper, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

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
    minWidth: '460px',
    padding: theme.spacing.unit * 2
  },
  input: {
    width: '100%'
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.unit
  },
  success: {
    color: 'green'
  }
})

class ConfirmShare extends Component {
  state = {}
  render() {
    const { classes, code } = this.props
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
                <Typography variant="h4">{code}</Typography>
              </Grid>

              <Grid item />

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
                  />
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </form>
      </div>
    )
  }
}

ConfirmShare.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  code: PropTypes.object
}

const makeMapStateToProps = (initialState, ownProps) => {
  const {
    match: {
      params: { id: code }
    }
  } = ownProps
  return code
}

export default connect(makeMapStateToProps)(withStyles(style)(ConfirmShare))
