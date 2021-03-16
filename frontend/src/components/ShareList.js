import React, { Component } from 'react'
import {
  TextField,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  DialogContent,
  DialogContentText,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import ErrorMessage from './ErrorMessage'
import { createShare } from '../actions/share'

const styles = (theme) => ({
  error: {
    color: theme.palette.error.main,
  },
})

class ShareList extends Component {
  state = {
    email: '',
    errorMessage: '',
  }

  handleChange = ({ target: { value } }) => {
    this.setState({ email: value })
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const { list } = this.props
    this.props.dispatch(
      createShare({
        email: this.state.email,
        listId: list.listId,
        listName: list.name,
      })
    )
    this.setState({ email: '' })
  }

  render() {
    const {
      open,
      onClose,
      classes,
      list,
      createdShare,
      createShareError,
    } = this.props

    const errorItem =
      createShareError && !createdShare ? (
        <ErrorMessage messageId={createShareError.id} />
      ) : null

    return (
      <Dialog
        open={!!open}
        list={list}
        keepMounted
        onClose={onClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        fullWidth
      >
        <DialogTitle id="alert-dialog-slide-title">Share List</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Sharing a list will send an invitation by email to view and edit
            your list
          </DialogContentText>
          <TextField
            id="email-textfield"
            className={classes.textfield}
            placeholder="Email Address"
            onChange={this.handleChange}
            value={this.state.email}
            fullWidth
          />
          {errorItem}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button
            id="share-btn"
            onClick={this.handleSubmit}
            color="primary"
            disabled={this.state.email.length < 1}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

ShareList.propTypes = {
  auth: PropTypes.object,
  list: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  createdShare: PropTypes.bool,
  createShareError: PropTypes.object,
}

const mapStateToProps = ({
  checklists: { createdShare, createShareError },
}) => ({ createdShare, createShareError })

export default connect(mapStateToProps)(withStyles(styles)(ShareList))
