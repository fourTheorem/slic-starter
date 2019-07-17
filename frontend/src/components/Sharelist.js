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
    isPanelExpanded: false,
    email: ''
  }

  handlePanelExpansion = () => {
    this.setState({ isPanelExpanded: !this.state.isPanelExpanded })
  }

  handleChange = ({ target: { value } }) => {
    this.setState({ email: value })
  }

  handleSubmit = event => {
    event.preventDefault()
    this.props.dispatch(
      addCollaborator({
        email: this.state.email,
        listId: this.props.list.listId
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
    const { list } = this.props

    return (
      <ExpansionPanel className={classes.collaboratorPanel}>
        <ExpansionPanelSummary>
          <Typography variant="h4">Collaborators</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container direction="column">
            <Grid item>
              <Typography
                variant="subtitle1"
                gutterBottom
                className={classes.desc}
              >
                Invite collaborators to participate in your list {list.name}
              </Typography>
            </Grid>
            <Grid item>
              <form onSubmit={this.handleSubmit}>
                <TextField
                  className={classes.textfield}
                  placeholder="Add Collaborator"
                  onChange={this.handleChange}
                  value={this.state.email}
                />
              </form>
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }
}

ShareList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  list: PropTypes.object
}

const mapStateToProps = ({ auth }) => ({ auth })

export default connect(mapStateToProps)(withStyles(styles)(ShareList))
