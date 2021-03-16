import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { Redirect } from 'react-router-dom'
import {
  ListItem,
  Menu,
  Button,
  MenuItem,
  IconButton,
  ListItemText,
  TextField,
  ListItemSecondaryAction,
  Checkbox,
  ClickAwayListener,
  List,
} from '@material-ui/core'

import { withStyles } from '@material-ui/core/styles'
import { MoreVert, Clear } from '@material-ui/icons'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import ConfirmationDialog from './ConfirmationDialog'

import {
  loadEntries,
  addEntry,
  setEntryValue,
  removeEntry,
} from '../actions/entries'

const styles = {
  hiddenButton: {
    visibility: 'hidden',
  },
  textField: {
    width: '100%',
  },
}

const ExtListItem = withStyles({
  container: {
    width: '100%',
  },
})(ListItem)

class Entries extends Component {
  state = {
    confirmDeleteListOpen: false,
    confirmDeleteEntryOpen: false,
    isEditingList: false,
    name: '',
    description: '',
    anchorPosition: null,
    editingId: null,
    updatedTitle: null,
    newEntryTitle: '',
  }

  componentDidUpdate(prevProps) {
    if (prevProps.list && !this.props.list) {
      // The list was deleted - go back home
      this.props.dispatch(push('/'))
    } else if (!prevProps.list && this.props.list) {
      const { list, dispatch } = this.props
      dispatch(loadEntries({ listId: list.listId }))
    }
  }

  validate = () => this.state.newEntryTitle.trim().length > 0

  componentDidMount() {
    this.setState({ newEntryTitle: '' })
    const { list, dispatch } = this.props
    if (this.props.list) {
      dispatch(loadEntries({ listId: list.listId }))
    }
  }

  handleEntrySubmit = (event) => {
    event.preventDefault()
    if (this.validate()) {
      this.props.dispatch(
        addEntry({
          listId: this.props.list.listId,
          title: this.state.newEntryTitle,
          value: false,
        })
      )
      this.setState({ newEntryTitle: '' })
    }
  }

  handleEntryTitleChange = ({ target: { value } }) => {
    this.setState({ newEntryTitle: value })
  }

  handleEntryValueChange = ({ target: { id, checked } }) => {
    const { dispatch, list, entries, updatingEntryValue } = this.props
    if (!updatingEntryValue) {
      const entry = entries.find((ent) => ent.entId === id)
      dispatch(
        setEntryValue({
          listId: list.listId,
          entry: { ...entry, value: checked },
        })
      )
    }
  }

  handleEntryRemovalRequest = (event) => {
    this.setState({
      confirmDeleteEntryOpen: true,
      editingId: this.state.menuEntryId,
      deletingEntry: true,
    })
  }

  handleEntryUpdateRequest = () => {
    const { entries } = this.props
    const entry = entries.find((ent) => ent.entId === this.state.menuEntryId)

    this.setState({
      editingId: this.state.menuEntryId,
      menuEntryId: null,
      anchorPosition: null,
      updatedTitle: entry.title,
    })
  }

  handleEntryUpdateSubmit = () => {
    const { dispatch, list, entries } = this.props
    const entry = entries.find((ent) => ent.entId === this.state.editingId)
    dispatch(
      setEntryValue({
        listId: list.listId,
        entry: { ...entry, title: this.state.updatedTitle },
      })
    )
    this.setState({
      editingId: null,
      menuEntryId: null,
      updatedTitle: null,
    })
  }

  onUpdateTitleChange = ({ target: { value } }) => {
    this.setState({ updatedTitle: value })
  }

  handleEntryRemovalRequestClose = () => {
    this.setState({ confirmDeleteEntryOpen: false })
  }

  handleRemoveListEntry = () => {
    const { dispatch, list } = this.props
    dispatch(removeEntry({ listId: list.listId, entId: this.state.editingId }))
    this.setState({ confirmDeleteEntryOpen: false, menuEntryId: null })
  }

  handleClickAway = () => {
    this.setState({ anchorPosition: null })
  }

  handleDropdownOpen = (event) => {
    const { x: left, y: top } = event.currentTarget.getBoundingClientRect()
    const anchorPosition = { left, top }
    this.setState({
      menuEntryId: event.currentTarget.id,
      anchorPosition,
    })
  }

  render() {
    const {
      addingEntry,
      gettingListEntries,
      updatingList,
      removingEntry,
      classes,
      error,
      entries,
      list,
      updatingEntryValue,
    } = this.props

    if (!list) {
      return <Redirect to="/" />
    }

    const deleteEntryDialog = (
      <ConfirmationDialog
        id="entry-confirmation"
        title="Delete Entry?"
        open={this.state.confirmDeleteEntryOpen}
        message="Are you sure you want to remove this entry permanently?"
        onConfirm={this.handleRemoveListEntry}
        onClose={this.handleEntryRemovalRequestClose}
      />
    )

    const errorItem =
      !gettingListEntries &&
      !addingEntry &&
      !updatingList &&
      !removingEntry &&
      !updatingEntryValue &&
      error ? (
        <ExtListItem>
          <ErrorMessage messageId={error.id} />
        </ExtListItem>
      ) : null

    const newItemEntry = addingEntry ? (
      <Loading />
    ) : (
      <ExtListItem>
        <IconButton className={classes.hiddenButton}>
          <Clear />
        </IconButton>
        <ListItemText>
          <TextField
            id="newEntryTitle"
            placeholder="Add an Item..."
            className={classes.textField}
            onChange={this.handleEntryTitleChange}
            value={this.state.newEntryTitle}
            autoFocus
          />
        </ListItemText>
        <ListItemSecondaryAction />
      </ExtListItem>
    )

    return (
      <ClickAwayListener onClickAway={this.handleClickAway}>
        <div>
          <List className={classes.list}>
            {entries.map((entry, index) => (
              <ExtListItem key={index}>
                <Button
                  className={classes.deleteEntryBtn}
                  onClick={this.handleDropdownOpen}
                  name={entry.title}
                  id={entry.entId}
                >
                  <MoreVert />
                </Button>
                {this.state.editingId === entry.entId &&
                !this.state.deletingEntry ? (
                  <form
                    autoComplete="off"
                    onSubmit={this.handleEntryUpdateSubmit}
                  >
                    <TextField
                      name="edit-entry"
                      id="edit-entry"
                      onChange={this.onUpdateTitleChange}
                      value={this.state.updatedTitle}
                    />
                    <Button color="primary" id="save-btn" type="submit">
                      Save
                    </Button>
                  </form>
                ) : (
                  <ListItemText>{entry.title}</ListItemText>
                )}
                <ListItemSecondaryAction>
                  <Checkbox
                    color="primary"
                    onChange={this.handleEntryValueChange}
                    id={entry.entId}
                    name={'checkbox-entry-'.concat(index)}
                    checked={!!entry.value}
                  />
                </ListItemSecondaryAction>
              </ExtListItem>
            ))}

            <form
              id="new-item-form"
              onSubmit={this.handleEntrySubmit}
              autoComplete="off"
            >
              {newItemEntry}
            </form>
            {errorItem}
          </List>
          <Menu
            open={!!this.state.anchorPosition}
            anchorReference="anchorPosition"
            anchorPosition={this.state.anchorPosition}
          >
            <MenuItem onClick={this.handleEntryUpdateRequest} id="edit-entry">
              Edit
            </MenuItem>
            <MenuItem
              id="delete-entry"
              onClick={this.handleEntryRemovalRequest}
            >
              Delete
            </MenuItem>
          </Menu>
          {deleteEntryDialog}
        </div>
      </ClickAwayListener>
    )
  }
}

Entries.propTypes = {
  addingEntry: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  gettingListEntries: PropTypes.bool.isRequired,
  updatingEntryValue: PropTypes.bool.isRequired,
  removingEntry: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  entries: PropTypes.array.isRequired,
  list: PropTypes.object,
  listId: PropTypes.string.isRequired,
  error: PropTypes.object,
  updatingList: PropTypes.bool,
  listUpdated: PropTypes.bool,
  updatedAt: PropTypes.any,
}

const makeMapStateToProps = (initialState, ownProps) => {
  const { listId } = ownProps
  return ({
    checklists: {
      addingEntry,
      gettingListEntries,
      entriesByListId,
      listsById,
      updatingEntryValue,
      addEntryError,
      listEntriesError,
      entryValueUpdateError,
      removeEntryError,
    },
  }) => {
    const list = listId ? listsById[listId] : {}
    const entries = entriesByListId[listId] || []
    return {
      entries,
      addingEntry,
      list,
      entriesByListId,
      gettingListEntries,
      updatingEntryValue,
      error:
        addEntryError ||
        listEntriesError ||
        entryValueUpdateError ||
        removeEntryError,
    }
  }
}
export default connect(makeMapStateToProps)(withStyles(styles)(Entries))
