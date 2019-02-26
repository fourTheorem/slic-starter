import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { push } from 'connected-react-router'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  List,
  ListItem,
  ListItemText,
  Grid,
  Slide,
  TextField,
  IconButton,
  Typography
} from '@material-ui/core'
import { Delete } from '@material-ui/icons'
import { CircularProgress } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import { removeList } from '../actions/checklists'
import { addEntry, loadEntries } from '../actions/entries'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2
  },
  textField: {
    width: '100%'
  }
})

function Transition(props) {
  return <Slide direction="up" {...props} />
}

class Checklist extends Component {
  state = {
    confirmDeleteOpen: false
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
    }
  }

  handleEntryTitleChange = ({ target: { value } }) =>
    this.setState({ newEntryTitle: value })

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
    const { list, dispatch } = this.props
    if (this.props.list) {
      dispatch(loadEntries({ listId: list.listId }))
    }
  }

  handleRemoveRequest = () => {
    this.setState({ confirmDeleteOpen: true })
  }

  handleCloseConfirmation = () => {
    this.setState({ confirmDeleteOpen: false })
  }

  handleRemove = () => {
    const { dispatch, list } = this.props
    dispatch(removeList({ listId: list.listId }))
  }

  render() {
    const {
      addingEntry,
      addEntryError,
      removing,
      classes,
      entries,
      list,
      fetchedListEntries
    } = this.props

    if (!list) {
      // List was deleted, go home
      return <Redirect to="/" />
    }

    const confirmDeleteDialog = (
      <Dialog
        open={this.state.confirmDeleteOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={this.handleCloseConfirmation}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Delete list?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {`Are you sure you want to remove the list '${list &&
              list.name}' permanently?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleRemove} color="primary">
            Confirm
          </Button>
          <Button onClick={this.handleCloseConfirmation}>Cancel</Button>
        </DialogActions>
      </Dialog>
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
        />
      </ListItem>
    )

    const errorItem =
      !addingEntry && addEntryError ? (
        <ListItem>
          <ErrorMessage messageId={addEntryError.id} />
        </ListItem>
      ) : null

    //Check if no list id is found

    //Check if list entries returned successfully

    return list ? (
      <form id="new-item-form" onSubmit={this.handleSubmit}>
        {confirmDeleteDialog}
        <Grid container layout="row" className={classes.root} justify="center">
          <Grid item xs={10} sm={8} md={4} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {list.name}
                </Typography>
                <List>
                  {entries.map((entry, index) => (
                    <ListItem key={index}>
                      <ListItemText>{entry.title}</ListItemText>
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
                  <IconButton onClick={this.handleRemoveRequest}>
                    <Delete />
                  </IconButton>
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
  addEntryError: PropTypes.object,
  removing: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  entries: PropTypes.array.isRequired,
  list: PropTypes.object
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
      addEntryError,
      listsById,
      entriesByListId,
      removing
    }
  }) => {
    const list = listId ? listsById[listId] : {}
    const entries = entriesByListId[listId] || []
    return {
      addingEntry,
      addEntryError,
      removing,
      entries,
      list
    }
  }
}

export default connect(makeMapStateToProps)(withStyles(styles)(Checklist))
