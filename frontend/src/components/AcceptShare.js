import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Grid, Paper, Typography } from '@material-ui/core'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { acceptShareRequest } from '../actions/share'

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

class AcceptShare extends Component {
  handleConfirm = event => {
    event.preventDefault()
    const { params } = this.props.match
    const { dispatch } = this.props
    dispatch(acceptShareRequest(params.id))
  }

  render() {
    const { classes } = this.props
    console.log(this.props)

    const { params } = this.props.match

    // if (!code) {
    //   return <Redirect to={`/Home`} />
    // }

    return (
      <div className={classes.root}>
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
              <Typography variant="h4">
                Accept invitation to collaborate
              </Typography>
              <Typography>Your code is: {params.id} </Typography>
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
                  id="accept"
                  className={classes.button}
                  onClick={this.handleConfirm}
                >
                  Accept Invite
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </div>
    )
  }
}

AcceptShare.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
}

const mapStateToProps = dispatch => ({
  dispatch
})

export default connect(mapStateToProps)(withStyles(style)(AcceptShare))
