import React, { Component } from 'react'
import {
  withStyles,
  Card,
  IconButton,
  TextField,
  Button,
  CardContent,
  Grid,
} from '@material-ui/core'
import { Clear } from '@material-ui/icons'

import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import PropTypes from 'prop-types'
import ErrorMessage from './ErrorMessage'
import ConfirmationDialog from './ConfirmationDialog'

import { createList, removeList, updateList } from '../actions/checklists'

const styles = (theme) => ({
  main: {
    padding: theme.spacing(4),
  },
  deleteBtn: {
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
    width: '100%',
  },
  textField: {
    width: '100%',
  },
})

class EditChecklist extends Component {
  state = {
    name: '',
    confirmDeleteListOpen: false,
  }

  handleCancel = () => {
    window.history.back()
  }

  handleChange = ({ target: { id, value } }) => {
    this.setState({ [id]: value })
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

  handleSubmission = (event) => {
    const { dispatch, list } = this.props

    if (!list.listId) {
      dispatch(
        createList({
          name: this.state.name,
          description: this.state.description,
        })
      )
    } else {
      dispatch(
        updateList({
          listId: list.listId,
          name: this.state.name || list.name,
          description: this.state.description || list.description,
        })
      )
    }
  }

  render() {
    const {
      creating,
      createdListId,
      creationError,
      updating,
      updatedListId,
      updateError,
      list,
      classes,
    } = this.props

    if (!list) {
      return <Redirect to="/" />
    }

    if (createdListId && !creating) {
      return <Redirect to={`/list/{${createdListId}}`} />
    }

    if (updatedListId && !updating) {
      return <Redirect to={`/list/${updatedListId}`} />
    }

    const errorItem = updateError ? (
      <Grid item>
        <ErrorMessage messageId={updateError.id} />
      </Grid>
    ) : null

    const createListError = creationError ? (
      <Grid item>
        <ErrorMessage messageId={creationError.id} />
      </Grid>
    ) : null

    const deleteListButton = list.listId ? (
      <Button
        className={classes.deleteBtn}
        variant="outlined"
        onClick={this.handleRemoveListRequest}
        id="delete-list-btn"
      >
        Delete List
      </Button>
    ) : null

    // ConfirmationDialog
    const confirmDeleteDialog = (
      <ConfirmationDialog
        id="list-confirmation"
        title="Delete List?"
        open={!!this.state.confirmDeleteListOpen}
        message={`Are you sure you want to remove the list '${
          list && list.name
        }' permanently?`}
        onConfirm={this.handleRemoveList}
        onClose={this.handleListRemovalClose}
      />
    )

    return (
      <Grid container layout="row" justify="center">
        <Grid item xs={12} sm={10} md={8} lg={6}>
          {confirmDeleteDialog}
          <Card>
            <CardContent>
              <Grid container direction="row" justify="flex-end">
                <Grid item>
                  <IconButton onClick={this.handleCancel} aria-label="Cancel">
                    <Clear />
                  </IconButton>
                </Grid>
              </Grid>
              <Grid
                container
                direction="column"
                spacing={2}
                className={classes.main}
              >
                <Grid item>
                  <TextField
                    id="name"
                    name="name"
                    required
                    className={classes.textField}
                    defaultValue={list.name}
                    label="List Name (400 Characters)"
                    autoFocus
                    autoComplete="off"
                    onChange={this.handleChange}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    id="description"
                    name="description"
                    multiline
                    className={classes.textField}
                    defaultValue={list.description}
                    rows="6"
                    rowsMax="20"
                    label="List Description (1250 Characters)"
                    margin="normal"
                    onChange={this.handleChange}
                  />
                </Grid>
                <Grid
                  container
                  item
                  direction="row"
                  justify="flex-end"
                  spacing={16}
                >
                  <Grid item>
                    <Button
                      color="primary"
                      onClick={this.handleSubmission}
                      variant="contained"
                      id="save-btn"
                    >
                      Save
                    </Button>
                  </Grid>
                </Grid>
                {errorItem}
                {createListError}
                <Grid item container direction="row" justify="center">
                  <Grid xs={12} sm={12} md={6} lg={4} item>
                    {deleteListButton}
                  </Grid>
                </Grid>
              </Grid>
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
  creating: PropTypes.bool.isRequired,
  createdListId: PropTypes.string,
  creationError: PropTypes.object,
  updating: PropTypes.bool.isRequired,
  updatedListId: PropTypes.string,
  updateError: PropTypes.object,
}

const makeMapStateToProps = (initialState, ownProps) => {
  const {
    match: {
      params: { id: listId },
    },
  } = ownProps

  return ({
    checklists: {
      listsById,
      creationError,
      createdListId,
      creating,
      updatedListId,
      updating,
      updateError,
    },
  }) => {
    const list = listId ? listsById[listId] : {}
    return {
      list,
      createdListId,
      creating,
      creationError,
      updating,
      updatedListId,
      updateError,
    }
  }
}

export default connect(makeMapStateToProps)(withStyles(styles)(EditChecklist))
