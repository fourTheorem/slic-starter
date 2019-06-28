import React, { Component } from 'react'
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  Grid,
  TextField
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

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
    isPanelExpanded: false,
    collabEmail: ''
  }

  handlePanelExpansion = () => {
    this.setState({ isPanelExpanded: !this.state.isPanelExpanded })
  }

  handleChange = ({ target: { value } }) => {
    this.setState({ collabEmail: value })
  }

  handleSubmit = event => {
    event.preventDefault()
    this.props.dispatch(
      addCollaborator({
        email: this.state.collabEmail,
        listId: this.props.list.listId
      })
    )
    this.setState({ collabEmail: '' })
  }

  conponentDidMount() {
    this.setState({ collabEmail: '' })
    const { list, dispatch } = this.props
    if (list) {
      dispatch(loadCollaborators({ listId: list.listId }))
    }
  }

  render() {
    const { classes } = this.props
    const { list } = this.props

    return (
      <ExpansionPanel className={classes.collaboratorPanel}>
        <ExpansionPanelSummary>
          <Typography variant="h4">Collaborators</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container direction="column" xs={12}>
            <Grid item>
              <Typography
                variant="subheading"
                gutterBottom
                className={classes.desc}
              >
                Invite collaborators to participate in your list {list.name}
              </Typography>
            </Grid>
            <Grid item>
              <TextField
                className={classes.textfield}
                placeholder="Add Collaborator"
                value={this.state.collabEmail}
                onChange={this.handleChange}
                onSubmit={this.handleSubmit}
              />
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }
}

ShareList.propTypes = {
  classes: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  list: PropTypes.object
}

export default withStyles(styles)(ShareList)
