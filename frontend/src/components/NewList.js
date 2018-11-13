import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Grid, TextField, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import { createList } from '../actions/checklists'
import { messages } from '../errors'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    height: '100%'
  },
  textField: {
    width: '100%'
  },
  form: {
    height: '100%'
  },
  error: {
    color: theme.palette.error.main
  }
})

class NewList extends Component {
  state = {
    name: ''
  }

  handleSubmit = event => {
    event.preventDefault()
    this.props.dispatch(createList(this.state))
  }

  validate = () => this.state.name.trim().length > 0

  handleChange = ({ target: { id, value } }) => this.setState({ [id]: value })

  render() {
    const { creating, creationError, classes } = this.props

    const errorItem = creationError ? (
      <Grid item>
        <Typography className={classes.error}>
          {messages[creationError.id]}
        </Typography>
      </Grid>
    ) : null

    return (
      <form onSubmit={this.handleSubmit} className={classes.form}>
        <Grid
          container
          direction="row"
          className={classes.root}
          justify="center"
          alignItems="center"
        >
          <Grid
            item
            container
            direction="column"
            alignItems="stretch"
            xs={10}
            sm={8}
            md={4}
            lg={3}
            spacing={8}
          >
            <Grid item>
              <TextField
                id="name"
                label="List Name"
                form="new-list-form"
                className={classes.textField}
                autoFocus
                onChange={this.handleChange}
              />
            </Grid>
            {errorItem}
            <Grid item container layout="row" justify="flex-end">
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  form="new-list-form"
                  disabled={creating || !this.validate()}
                >
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    )
  }
}

NewList.propTypes = {
  creating: PropTypes.bool.isRequired,
  creationError: PropTypes.object,
  classes: PropTypes.object.isRequired
}

const mapStateToProps = ({ checklists: { creationError, creating } }) => ({
  creationError,
  creating
})

export default connect(mapStateToProps)(withStyles(styles)(NewList))
