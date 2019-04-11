import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect, Link } from 'react-router-dom'
import { push } from 'connected-react-router'
import { ExpandMore, Clear, Edit } from '@material-ui/icons'
import {
  Card,
  CardActions,
  CardContent,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Grid,
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
  deleteEntryBtn: {},
  expansionPanel: {
    '&:before': {
      display: 'none'
    }
  },
  createdAt: {}
})

class Checklist extends Component {
  state = {
    confirmDeleteListOpen: false,
    confirmDeleteEntryOpen: false,
    entId: '',
    isEditingList: false,
    name: '',
    description: '',
    isPanelExpanded: false
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

  handleRemoveListEntry = () => {
    const { dispatch, list } = this.props
    dispatch(removeEntry({ listId: list.listId, entId: this.state.entId }))
    this.setState({ confirmDeleteEntryOpen: false })
  }

  handlePanelExpansion = () => {
    this.setState({ isPanelExpanded: !this.state.isPanelExpanded })
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
          <Grid container direction="column">
            <Grid item>
              <Typography variant="caption">{date}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subheading" className={classes.description}>
                {list.description}
              </Typography>
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
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
      <form id="new-item-form" onSubmit={this.handleSubmit} autoComplete="off">
        {deleteEntryDialog}
        <Grid container layout="row" justify="center">
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <Card>
              <CardContent>
                <Grid container direction="row" justify="flex-end">
                  <Grid item>
                    <IconButton
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
                      <IconButton
                        className={classes.deleteEntryBtn}
                        onClick={this.handleEntryRemoval}
                        name={'delete-entry-btn-'.concat(index)}
                        id={entry.entId}
                      >
                        <Clear />
                      </IconButton>
                      <ListItemText>{entry.title}</ListItemText>
                      <ListItemSecondaryAction>
                        <Switch
                          onChange={this.handleChange}
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
