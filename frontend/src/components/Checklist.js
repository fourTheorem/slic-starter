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
  ListItemText,
  Grid,
  Fab,
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

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    height: '100%'
  },
  textField: {
    width: '100%',
    paddingRight: '2.5%'
  },
  typography: {
    whiteSpace: 'pre-line'
  },
  card: {
    height: '300',
    width: '120%',
    maxHeight: '600'
  },

  description: {
    fontSize: 18,
    marginTop: '7%',
    marginLeft: '-29%',
    whiteSpace: 'pre-line',
    width: '85%'
  },

  title: {
    fontSize: 18,
    height: 200,
    maxHeight: 300,
    overflow: 'hidden'
  },

  deleteBtn: {
    marginLeft: 50
  },

  editButton: {
    marginLeft: '20%',
    marginRight: 10
  },

  deleteEntryBtn: {},

  entryCheckbox: {
    marginRight: '12.5%'
  },

  collapsedSummary: {
    minHeight: 150,
    maxHeight: 650
  },

  fab: {
    marginLeft: '75%',
    marginTop: '-5%'
  },

  createdAt: {
    fontSize: 13,
    marginBottom: '5%'
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
        expanded={this.state.isPanelExpanded}
        onChange={this.handlePanelExpansion}
      >
        <ExpansionPanelSummary
          id="expansion-summary"
          expandIcon={<ExpandMore />}
          className={classes.collapsedSummary}
        >
          <Typography variant="h4">{list.name}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography variant="caption" className={classes.createdAt}>
            {date}
          </Typography>
          <Typography variant="subheading" className={classes.description}>
            {list.description}
          </Typography>
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
        {deleteEntryDialog}
        <Grid container layout="row" justify="center" className={classes.root}>
          <Grid item xs={10} sm={8} md={4} lg={3}>
            <Card className={classes.card}>
              <CardContent>
                {expansionPanel}
                <List>
                  {entries.map((entry, index) => (
                    <ListItem button alignItem="flex" key={index}>
                      <IconButton
                        className={classes.deleteEntryBtn}
                        onClick={this.handleEntryRemoval}
                        name={'delete-entry-btn-'.concat(index)}
                        id={entry.entId}
                      >
                        <Clear />
                      </IconButton>

                      <ListItemText>{entry.title}</ListItemText>
                      <Switch
                        className={classes.entryCheckbox}
                        onChange={this.handleChange}
                        id={entry.entId}
                        name={'checkbox-entry-'.concat(index)}
                        checked={!!entry.value}
                      />
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
                    <Grid item className={classes.fab} style={{ width: '10%' }}>
                      <Fab
                        color="secondary"
                        aria-label="Edit"
                        component={Link}
                        to={`/list/${list.listId}/edit`}
                      >
                        <Edit />
                      </Fab>
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
