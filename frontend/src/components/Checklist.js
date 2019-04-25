import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect, Link } from 'react-router-dom'
import { push } from 'connected-react-router'
import { ExpandMore, MoreVert, Clear, Edit } from '@material-ui/icons'
import {
  Card,
  Button,
  CardActions,
  CardContent,
  ClickAwayListener,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Grid,
  Menu,
  MenuItem,
  TextField,
  Switch,
  IconButton,
  Typography
} from '@material-ui/core'
import {
  CircularProgress,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import {
  addEntry,
  loadEntries,
  setEntryValue,
  removeEntry
} from '../actions/entries'
import ConfirmationDialog from './ConfirmationDialog'

const dateFns = require('date-fns')

const ExtListItem = withStyles({
  container: {
    width: '100%'
  }
})(ListItem)

const ExtExpansionPanelSummary = withStyles({
  content: {
    width: '100%'
  }
})(ExpansionPanelSummary)

const styles = theme => ({
  textField: {
    width: '100%',
    paddingRight: '2.5%'
  },
  typography: {
    whiteSpace: 'pre-line'
  },
  list: {
    width: '100%'
  },
  listItem: {
    width: '100%'
  },
  description: {
    whiteSpace: 'pre-line'
  },
  title: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  hiddenButton: {
    visibility: 'hidden'
  },
  expansionPanel: {
    '&:before': {
      display: 'none'
    }
  }
})

class Checklist extends Component {
  state = {
    confirmDeleteListOpen: false,
    confirmDeleteEntryOpen: false,
    entId: '',
    isEditingList: false,
    name: '',
    description: '',
    isPanelExpanded: false,
    isUpdatingEntry: false,
    isDropdownOpen: false,
    anchorEl: null,
    editingId: null,
    updatedTitle: '',
    deletingEntry: false
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

  componentDidMount() {
    this.setState({ newEntryTitle: '' })
    const { list, dispatch } = this.props
    if (this.props.list) {
      dispatch(loadEntries({ listId: list.listId }))
    }
  }

  validate = () => this.state.newEntryTitle.trim().length > 0

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
      entId: event.target.id,
      isDropdownOpen: false,
      confirmDeleteEntryOpen: true,
      editingId: this.state.menuEntryId,
      deletingEntry: true
    })
  }

  handleEntryUpdateRequest = event => {
    this.setState({
      isDropdownOpen: false,
      isUpdatingEntry: true,
      editingId: this.state.menuEntryId
    })
  }

  handleEntryUpdateSubmit = event => {
    const { dispatch, list, entries } = this.props

    const entry = entries.find(ent => ent.entId === this.state.editingId)
    dispatch(
      setEntryValue({
        listId: list.listId,
        entry: { ...entry, title: this.state.updatedTitle }
      })
    )
    this.setState({ editingId: null, menuEntryId: null })
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

  handlePanelExpansion = () => {
    this.setState({ isPanelExpanded: !this.state.isPanelExpanded })
  }

  handleDropdownOpen = event => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen,
      anchorEl: event.currentTarget,
      menuEntryId: event.currentTarget.id
    })
  }

  handleClickAway = () => {
    this.setState({ isDropdownOpen: false })
  }

  render() {
    const {
      addingEntry,
      removing,
      classes,
      gettingListEntries,
      entries,
      list,
      updatingEntryValue,
      removingEntry,
      error,
      updatingList
    } = this.props

    if (!list) {
      // List was deleted, go home
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

    const date = `Created ${dateFns.distanceInWords(
      Date.now(),
      list.createdAt
    )} ago`

    const expansionPanel = (
      <ExpansionPanel
        elevation={0}
        className={classes.expansionPanel}
        expanded={this.state.isPanelExpanded}
        onChange={this.handlePanelExpansion}
      >
        <ExtExpansionPanelSummary
          id="expansion-summary"
          expandIcon={<ExpandMore />}
        >
          <Typography variant="h4" className={classes.title}>
            {list.name}
          </Typography>
        </ExtExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container direction="column" spacing={16}>
            <Grid item>
              <Typography variant="caption">{date}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h6" className={classes.description}>
                {list.description}
              </Typography>
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )

    const entryDropdownMenu = (
      <Menu open={this.state.isDropdownOpen} anchorEl={this.state.anchorEl}>
        <MenuItem onClick={this.handleEntryUpdateRequest}>Edit</MenuItem>
        <MenuItem onClick={this.handleEntryRemoval}>Delete</MenuItem>
      </Menu>
    )

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
        </ListItemText>
        <ListItemSecondaryAction />
      </ExtListItem>
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

    return list && !gettingListEntries ? (
      <form
        id="new-item-form"
        onSubmit={this.handleEntrySubmit}
        autoComplete="off"
      >
        {deleteEntryDialog}
        <Grid container layout="row" justify="center">
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <Card>
              <CardContent>
                <Grid container direction="row" justify="flex-end">
                  <Grid item>
                    <IconButton
                      id="edit-list-btn"
                      aria-label="Edit"
                      component={Link}
                      to={`/list/${list.listId}/edit`}
                    >
                      <Edit />
                    </IconButton>
                  </Grid>
                </Grid>
                {expansionPanel}
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
                      {entryDropdownMenu}
                      {this.state.editingId === entry.entId &&
                      !this.State.deletingEntry ? (
                        <form onSubmit={this.handleEntryUpdateSubmit}>
                          <TextField
                            onChange={this.onUpdateTitleChange}
                            value={this.state.updatedTitle}
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
                  {newItemEntry}
                  {errorItem}
                </List>
              </CardContent>
              <CardActions>
                {removing ? <CircularProgress /> : null}
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </form>
    ) : (
      <Loading />
    )
  }
}

Checklist.propTypes = {
  addingEntry: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  gettingListEntries: PropTypes.bool.isRequired,
  updatingEntryValue: PropTypes.bool.isRequired,
  removingEntry: PropTypes.bool,
  removing: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  entries: PropTypes.array.isRequired,
  list: PropTypes.object,
  error: PropTypes.object,
  updatingList: PropTypes.bool,
  listUpdated: PropTypes.bool,
  updatedAt: PropTypes.any
}

const makeMapStateToProps = (initialState, ownProps) => {
  const {
    match: {
      params: { id: listId }
    }
  } = ownProps

  return ({
    checklists: {
      addingEntry,
      gettingListEntries,
      listsById,
      entriesByListId,
      removing,
      updatingEntryValue,
      addEntryError,
      listEntriesError,
      entryValueUpdateError,
      removalError,
      removeEntryError
    }
  }) => {
    const list = listId ? listsById[listId] : {}
    const entries = entriesByListId[listId] || []
    return {
      addingEntry,
      entries,
      entriesByListId,
      gettingListEntries,
      list,
      listsById,
      removing,
      updatingEntryValue,
      error:
        addEntryError ||
        listEntriesError ||
        entryValueUpdateError ||
        removeEntryError ||
        removalError
    }
  }
}

export default connect(makeMapStateToProps)(withStyles(styles)(Checklist))
