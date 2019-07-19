import React, { Component } from 'react'
import {
  Typography,
  TextField,
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  DialogContent,
  DialogContentText
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { addCollaborator, loadCollaborators } from '../actions/share'

const styles = {
  collaboratorPanel: {
    width: '45%'
    //TODO: Fix spacing for this component
  },
  divider: {
    margin: '5px',
    padding: '1px'
  },
  textfield: {
    width: '100%'
  }
}

class ShareList extends Component {
  state = {
    email: ''
  }

  handleChange = ({ target: { value } }) => {
    this.setState({ email: value })
  }

  handleSubmit = event => {
    event.preventDefault()
    this.props.dispatch(
      addCollaborator({
        email: this.state.email,
        listId: this.props.list.listId,
        listName: this.props.list.name
      })
    )
    this.setState({ email: '' })
  }

  conponentDidMount() {
    const { list } = this.props
    if (list) {
      this.props.dispatch(loadCollaborators({ listId: list.listId }))
    }
  }

  render() {
    const { classes } = this.props

    const { createdCollaborator } = this.props

    const listShared = createdCollaborator ? (
      <Grid item>
        <Typography>List shared successfully</Typography>
      </Grid>
    ) : null

    const { open, list, onClose } = this.props
    return (
      <Dialog
        open={open}
        list={list}
        keepMounted
        onClose={onClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Share List</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Share {list.name} with friends!
          </DialogContentText>
          <form onSubmit={this.handleSubmit}>
            <TextField
              className={classes.textfield}
              placeholder="Add Collaborator Email"
              onChange={this.handleChange}
              value={this.state.email}
            />
          </form>
          {listShared}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleSubmit} color="primary">
            Add
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

ShareList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  list: PropTypes.object,
  createdCollaborator: PropTypes.string,
  createCollaboratorError: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

const mapStateToProps = ({ auth }) => ({ auth })

export default connect(mapStateToProps)(withStyles(styles)(ShareList))
