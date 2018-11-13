import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Grid, TextField } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import { createList } from '../actions/checklists'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    height: '100%'
  },
  textField: {
    width: '100%'
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
    const { creating, classes } = this.props

    return (
      <Grid
        container
        direction="row"
        className={classes.root}
        justify="center"
        alignItems="center"
      >
        <form onSubmit={this.handleSubmit} />
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
              className={classes.textField}
              autoFocus
              onChange={this.handleChange}
            />
          </Grid>
          <Grid item container layout="row" justify="flex-end">
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                disabled={creating || !this.validate()}
              >
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

NewList.propTypes = {
  creating: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired
}

const mapStateToProps = () => ({})

export default connect(mapStateToProps)(withStyles(styles)(NewList))
