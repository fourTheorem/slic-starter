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
  Switch,
  ClickAwayListener,
  List
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
  removeEntry
} from '../actions/entries'

const styles = {
  hiddenButton: {
    visibility: 'hidden'
  }
}

class Entries extends Component {
  state = {
    confirmDeleteListOpen: false,
    confirmDeleteEntryOpen: false,
    isEditingList: false,
    name: '',
    description: '',
    anchorPosition: null,
    editingId: null,
    updatedTitle: '',
    newEntryTitle: ''
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

  handleEntrySubmit = event => {
    event.preventDefault()
    if (this.validate()) {
      this.props.dispatch(
        addEntry({
          listId: this.props.list.listId,
          title: this.state.newEntryTitle,
          value: false
        })
      )
      this.setState({ newEntryTitle: '' })
    }
  }

  handleEntryTitleChange = ({ target: { value } }) => {
    this.setState({ newEntryTitle: value })
  }

  handleEntryValueChange = ({ target: { id, checked } }) => {
    const { dispatch, list, entries } = this.props
    const entry = entries.find(ent => ent.entId === id)
    dispatch(
      setEntryValue({
        listId: list.listId,
        entry: { ...entry, value: checked }
      })
    )
  }

  handleEntryRemoval = event => {
    this.setState({
      confirmDeleteEntryOpen: true,
      editingId: this.state.menuEntryId,
      deletingEntry: true
    })
  }

  handleEntryUpdateRequest = () => {
    this.setState({
      isUpdatingEntry: true,
      editingId: this.state.menuEntryId
    })
  }

  handleEntryUpdateSubmit = () => {
    const { dispatch, list, entries } = this.props
    const entry = entries.find(ent => ent.entId === this.state.editingId)
    dispatch(
      setEntryValue({
        listId: list.listId,
        entry: { ...entry, title: this.state.updatedTitle }
      })
    )
    this.setState({
      editingId: null,
      menuEntryId: null,
      updatedTitle: entry.title
    })
  }

  onUpdateTitleChange = ({ target: { value } }) => {
    this.setState({ updatedTitle: value })
  }

  handleEntryRemovalClose = () => {
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

  handleDropdownOpen = event => {
    console.log('handleDropdownOpen', event.target)
    const { x: left, y: top } = event.currentTarget.getBoundingClientRect()
    const anchorPosition = { left, top }
    this.setState({
      menuEntryId: event.currentTarget.id,
      anchorPosition
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
      updatingEntryValue
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
        onClose={this.handleEntryRemovalClose}
      />
    )

    const ExtListItem = withStyles({
      container: {
        width: '100%'
      }
    })(ListItem)

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
            autoFocus
            form="new-item-form"
            className={classes.textField}
            onChange={this.handleEntryTitleChange}
            value={this.state.newEntryTitle}
          />
          {deleteEntryDialog}
        </ListItemText>
        <ListItemSecondaryAction />
      </ExtListItem>
    )

    console.log('Render Entries')
    return (
      <React.Fragment>
        <List className={classes.list}>
          {entries.map((entry, index) => (
            <ExtListItem key={index}>
              <ClickAwayListener onClickAway={this.handleClickAway}>
                <Button
                  className={classes.deleteEntryBtn}
                  onClick={this.handleDropdownOpen}
                  name="options"
                  id={entry.entId}
                >
                  <MoreVert />
                </Button>
              </ClickAwayListener>
              {this.state.editingId === entry.entId &&
              !this.state.deletingEntry ? (
                <form id="update-entry" onSubmit={this.handleEntryUpdateSubmit}>
                  <TextField
                    onChange={this.onUpdateTitleChange}
                    value={this.state.updatedTitle}
                    form="update-entry"
                  />
                </form>
              ) : (
                <ListItemText>{entry.title}</ListItemText>
              )}
              <ListItemSecondaryAction>
                <Switch
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
          <MenuItem onClick={this.handleEntryUpdateRequest}>Edit</MenuItem>
          <MenuItem onClick={this.handleEntryRemoval}>Delete</MenuItem>
        </Menu>
      </React.Fragment>
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
  updatedAt: PropTypes.any
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
      removeEntryError
    }
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
        removeEntryError
    }
  }
}
export default connect(makeMapStateToProps)(withStyles(styles)(Entries))
