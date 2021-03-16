import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'

import { messages } from '../errors'

const styles = (theme) => ({
  error: {
    color: theme.palette.error.main,
  },
})

class ErrorMessage extends React.Component {
  render() {
    const { classes, messageId } = this.props

    const message = messages[messageId]

    return <Typography className={classes.error}>{message}</Typography>
  }
}

ErrorMessage.propTypes = {
  messageId: PropTypes.symbol.isRequired,
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(ErrorMessage)
