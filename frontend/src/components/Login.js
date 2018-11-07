import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core'

import { connect } from 'react-redux'

const styles = theme => ({
  root: {
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
  }
})

class Login extends Component {
  render() {
    const { classes } = this.props

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
              <Typography variant="h3">Log In</Typography>
            </Grid>
            <Grid item>
              <TextField label="Email" className={classes.input} />
            </Grid>
            <Grid item>
              <TextField
                label="Password"
                type="password"
                className={classes.input}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                className={classes.button}
              >
                Log In
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>
    )
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired
}

const mapStateToProps = () => ({})

export default connect(mapStateToProps)(withStyles(styles)(Login))
