import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect, Link } from 'react-router-dom'
import { ExpandMore, Edit, Share } from '@material-ui/icons'
import {
  Card,
  CardActions,
  CardContent,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core'
import {
  CircularProgress,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import Loading from './Loading'
import Entries from './Entries'
import ShareList from './ShareList'
import { editShare, cancelShare } from '../actions/share'

const dateFns = require('date-fns')

const ExtExpansionPanelSummary = withStyles({
  content: {
    width: '100%',
  },
})(ExpansionPanelSummary)

const styles = (theme) => ({
  typography: {
    whiteSpace: 'pre-line',
  },
  list: {
    width: '100%',
  },
  listItem: {
    width: '100%',
  },
  description: {
    whiteSpace: 'pre-line',
  },
  title: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  hiddenButton: {
    visibility: 'hidden',
  },
  expansionPanel: {
    '&:before': {
      display: 'none',
    },
  },
})

class Checklist extends Component {
  state = {
    isEditingList: false,
    name: '',
    description: '',
    isPanelExpanded: false,
    editingId: null,
    updatedTitle: '',
  }

  handlePanelExpansion = () => {
    this.setState({ isPanelExpanded: !this.state.isPanelExpanded })
  }

  handleOpen = () => {
    this.props.dispatch(editShare())
  }

  handleShareClose = () => {
    this.props.dispatch(cancelShare())
  }

  render() {
    const { removing, classes, list } = this.props

    if (!list) {
      // List was deleted, go home
      return <Redirect to="/" />
    }

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
          <Grid container direction="column" spacing={2}>
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

    return list ? (
      <Grid container layout="row" justify="center">
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <Card>
            <CardContent>
              <Grid container direction="row" justify="flex-end">
                <Grid item>
                  <IconButton
                    id="share-list-btn"
                    aria-label="Share"
                    onClick={this.handleOpen}
                  >
                    <Share />
                  </IconButton>
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
              <Entries listId={list.listId} />
            </CardContent>
            <CardActions>{removing ? <CircularProgress /> : null}</CardActions>
          </Card>
          <ShareList
            list={list}
            open={this.props.editingShare}
            onClose={this.handleShareClose}
          />
        </Grid>
      </Grid>
    ) : (
      <Loading />
    )
  }
}

Checklist.propTypes = {
  dispatch: PropTypes.func.isRequired,
  removing: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  list: PropTypes.object,
  error: PropTypes.object,
  updatingList: PropTypes.bool,
  listUpdated: PropTypes.bool,
  editingShare: PropTypes.bool,
  updatedAt: PropTypes.any,
}

const makeMapStateToProps = (initialState, ownProps) => {
  const {
    match: {
      params: { id: listId },
    },
  } = ownProps

  return ({
    checklists: { editingShare, listsById, removing, removalError },
  }) => {
    const list = listId ? listsById[listId] : {}
    return {
      editingShare,
      list,
      listsById,
      removing,
      error: removalError,
    }
  }
}

export default connect(makeMapStateToProps)(withStyles(styles)(Checklist))
