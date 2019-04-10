import React, { Component } from 'react'
import {
  withStyles,
  Card,
  TextField,
  Button,
  CardContent,
  Grid,
  Divider
} from '@material-ui/core'

import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import PropTypes from 'prop-types'
import ConfirmationDialog from './ConfirmationDialog'

import { removeList, updateList } from '../actions/checklists'

const style = {
  deleteBtn: {
    marginTop: '5%'
  }
}

class EditChecklist extends Component {
  state = {
    name: '',
    description: '',
    confirmDeleteListOpen: false,
    updateCancelled: false
  }

  handleRemoveListRequest = () => {
    this.setState({ confirmDeleteListOpen: true })
  }

  handleListRemovalClose = () => {
    this.setState({ confirmDeleteListOpen: false })
  }

  handleRemoveList = () => {
    const { dispatch, list } = this.props
    dispatch(removeList({ listId: list.listId }))
  }

  handleUpdateSubmission = event => {
    const { dispatch, list } = this.props
    dispatch(
      updateList({
        listId: list.listId,
        name: this.state.name || list.name,
        description: this.state.description || list.description
      })
    )
  }

  handleTitleUpdate = event => {
    this.setState({ name: event.target.value })
  }

  handleDescriptionUpdate = event => {
    this.setState({ description: event.target.value })
  }

  handleCancelUpdate = () => {
    this.setState({ updateCancelled: true })
  }

  render() {
    const { list, classes, listUpdated } = this.props

    const updateCancel = this.state.updateCancelled ? (
      <Redirect to={`/list/${list.listId}`} />
    ) : null

    if (!list) {
      return <Redirect to="/" />
    }

    // ConfirmationDialog
    const confirmDeleteDialog = (
      <ConfirmationDialog
        id="list-confirmation"
        title="Delete List?"
        open={this.state.confirmDeleteListOpen}
        message={`Are you sure you want to remove the list '${list &&
          list.name}' permanently?`}
        onConfirm={this.handleRemoveList}
        onClose={this.handleListRemovalClose}
      />
    )

    return (
      <Grid container layout="row" justify="center">
        <Grid item xs={10} sm={8} md={4} lg={3}>
          {confirmDeleteDialog}
          <Card>
            <CardContent>
              <Divider className={classes.divider} />
              <form>
                <TextField
                  id="name"
                  name="name"
                  required
                  style={{ width: '100%' }}
                  variant="outlined"
                  defaultValue={list.name}
                  label="List Name (400 Characters)"
                  autoFocus
                  onChange={this.handleTitleUpdate}
                />
                <TextField
                  id="description"
                  name="description"
                  multiline
                  required
                  style={{ width: '100%' }}
                  variant="outlined"
                  defaultValue={list.description}
                  rows="6"
                  label="List Description (1250 Characters)"
                  margin="normal"
                  onChange={this.handleDescriptionUpdate}
                />

                <Grid item style={({ marginBottom: 25 }, { float: 'right' })}>
                  <Button color="secondary" onClick={this.handleCancelUpdate}>
                    Cancel
                  </Button>
                  {updateCancel}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={this.handleUpdateSubmission}
                  >
                    Save
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    color="primary"
                    className={classes.deleteBtn}
                    variant="outlined"
                    style={{ width: '100%' }}
                    onClick={this.handleRemoveListRequest}
                  >
                    Delete List
                  </Button>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }
}

EditChecklist.propTypes = {
  list: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  listUpdated: PropTypes.bool.isRequired
}

const makeMapStateToProps = (initialState, ownProps) => {
  const {
    match: {
      params: { id: listId }
    }
  } = ownProps

  return ({ checklists: { listsById } }) => {
    const list = listId ? listsById[listId] : {}
    return {
      list
    }
  }
}

export default connect(makeMapStateToProps)(withStyles(style)(EditChecklist))
