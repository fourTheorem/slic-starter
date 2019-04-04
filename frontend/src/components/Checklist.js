import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { push } from 'connected-react-router'
import { ExpandMore, Edit, Delete, Clear } from '@material-ui/icons'
import {
  Card,
  CardActions,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Grid,
  TextField,
  IconButton,
  Typography
} from '@material-ui/core'
import {
  Button,
  CircularProgress,
  Checkbox,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import { removeList, updateList } from '../actions/checklists'
import {
  addEntry,
  loadEntries,
  setEntryValue,
  removeEntry
} from '../actions/entries'
import ConfirmationDialog from './ConfirmationDialog'

const dateFns = require('date-fns')

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2
  },
  textField: {
    width: '100%'
  },
  typography: {
    whiteSpace: 'pre-line'
  },
  card: {
    minHeight: 300,
    width: 600
  },
  divider: {
    marginTop: 20
  },

  title: {
    fontSize: 20
  },

  collapsedSummary: {
    height: 100,
    overflow: 'hidden'
  },

  description: {
    minHeight: '1.2em',
    maxHeight: '1.2em',
    maxWidth: '100%',
    overflow: 'auto'
  }
})

class Checklist extends Component {
  state = {
    confirmDeleteListOpen: false,
    confirmDeleteEntryOpen: false,
    entId: '',
    isEditingList: false,
    name: '',
    description: ''
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

  handleSubmit = event => {
    event.preventDefault()
    if (this.validate()) {
      this.props.dispatch(
        addEntry({
          listId: this.props.list.listId,
          title: this.state.newEntryTitle
        })
      )
      this.setState({ newEntryTitle: '' })
    }
  }

  handleUpdateSubmission = event => {
    const { dispatch, list } = this.props
    dispatch(
      updateList({
        listId: list.listId,
        name: this.state.name || list.name,
        description: this.state.description || list.description
      }),
      this.setState({ isEditingList: false })
    )
  }

  handleTitleUpdate = event => {
    this.setState({ name: event.target.value })
  }

  handleDescriptionUpdate = event => {
    this.setState({ description: event.target.value })
  }

  handleEntryTitleChange = ({ target: { value } }) => {
    this.setState({ newEntryTitle: value })
  }

  handleChange = ({ target: { id, checked } }) => {
    const { dispatch, list, entries } = this.props
    const entry = entries.find(ent => ent.entId === id)
    dispatch(
      setEntryValue({
        listId: list.listId,
        entry: { ...entry, value: checked }
      })
    )
  }

  handleEntryRemoval = e => {
    this.setState({ entId: '' })
    this.setState({ confirmDeleteEntryOpen: true })
    this.setState({ entId: e.currentTarget.id })
  }

  handleEntryRemovalClose = () => {
    this.setState({ confirmDeleteEntryOpen: false })
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

  handleRemoveListEntry = () => {
    const { dispatch, list } = this.props
    dispatch(removeEntry({ listId: list.listId, entId: this.state.entId }))
    this.setState({ confirmDeleteEntryOpen: false })
  }

  handleEditRequest = () => {
    this.setState({ isEditingList: !this.state.isEditingList })
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

    const displayTitle = this.state.isEditingList ? (
      <TextField
        id="name"
        name="name"
        defaultValue={list.name}
        variant="outlined"
        label="List Name"
        className={classes.textField}
        autoFocus
        onChange={this.handleTitleUpdate}
      />
    ) : (
      <Typography variant="h4" classsName={classes.title}>
        {list.name}
      </Typography>
    )

    const displayDescription = this.state.isEditingList ? (
      <TextField
        inputProps={{ maxLength: 1250 }}
        id="description"
        name="description"
        multiline
        defaultValue={list.description}
        required
        variant="outlined"
        rows="3"
        label="List Description (1250 Characters)"
        className={classes.textField}
        margin="normal"
        onChange={this.handleDescriptionUpdate}
      />
    ) : (
      <Typography id="list-description" className={classes.typography}>
        {list.description}
      </Typography>
    )

    const date = `Created ${dateFns.distanceInWords(
      Date.now(),
      list.createdAt
    )} ago`

    const expansionPanel = (
      <ExpansionPanel elevation={0}>
        <ExpansionPanelSummary
          id="expansion-summary"
          expandIcon={<ExpandMore />}
          className={classes.collapsedSummary}
        >
          {displayTitle}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid item container>
            <Grid item>
              {date}
              {displayDescription}
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )

    const newItemEntry = addingEntry ? (
      <Loading />
    ) : (
      <ListItem>
        <TextField
          id="newEntryTitle"
          placeholder="Add an Item..."
          autoFocus
          form="new-item-form"
          className={classes.textField}
          onChange={this.handleEntryTitleChange}
          value={this.state.newEntryTitle}
        />
      </ListItem>
    )

    const editButtons = this.state.isEditingList ? (
      <Button
        color="primary"
        variant="contained"
        className={classes.button}
        onClick={this.handleUpdateSubmission}
      >
        Update
      </Button>
    ) : (
      <IconButton onClick={this.handleEditRequest}>
        <Edit />
      </IconButton>
    )
    const errorItem =
      !gettingListEntries &&
      !addingEntry &&
      !updatingList &&
      !removingEntry &&
      !updatingEntryValue &&
      error ? (
        <ListItem>
          <ErrorMessage messageId={error.id} />
        </ListItem>
      ) : null

    return list && !gettingListEntries ? (
      <form id="new-item-form" onSubmit={this.handleSubmit} autoComplete="off">
        {confirmDeleteDialog}
        {deleteEntryDialog}
        <Grid container layout="row" justify="center" className={classes.root}>
          <Grid item xs={10} sm={8} md={4} lg={3}>
            <Card className={classes.card}>
              <CardContent>
                {expansionPanel}
                <List>
                  {entries.map((entry, index) => (
                    <ListItem key={index}>
                      <ListItemText>{entry.title}</ListItemText>
                      <Checkbox
                        onChange={this.handleChange}
                        id={entry.entId}
                        name={'checkbox-entry-'.concat(index)}
                        checked={!!entry.value}
                      />
                      <IconButton
                        onClick={this.handleEntryRemoval}
                        name={'delete-entry-btn-'.concat(index)}
                        id={entry.entId}
                      >
                        <Clear />
                      </IconButton>
                    </ListItem>
                  ))}
                  {newItemEntry}
                  {errorItem}
                </List>
              </CardContent>
              <CardActions>
                {removing ? (
                  <CircularProgress />
                ) : (
                  <Grid item container>
                    <Grid item>
                      <IconButton
                        id="delete-list-btn"
                        onClick={this.handleRemoveListRequest}
                      >
                        <Delete />
                      </IconButton>
                      {editButtons}
                    </Grid>
                  </Grid>
                )}
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
