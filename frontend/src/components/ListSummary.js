import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  withStyles,
  Card,
  CardMedia,
  CardActionArea,
  CardContent,
  Typography,
} from '@material-ui/core'

const generate = require('string-to-color')

const TextTruncate = require('react-text-truncate')

const dateFns = require('date-fns')

const styles = {
  card: {
    maxWidth: 400,
    minHeight: 400,
    maxHeight: 400,
  },

  media: {
    height: 140,
  },

  description: {
    height: '12em',
    paddingBottom: 4,
    marginBottom: 8,
    overflow: 'hidden',
    color: '#444343',
    maxHeight: '12em',
    whiteSpace: 'pre-line',
  },

  title: {
    color: '#3d3d3d',
    fontSize: 21,
  },
}

class ListSummary extends Component {
  render() {
    const { list, classes } = this.props
    const tileColor = generate(list.name)
    const newStyle = {
      backgroundColor: tileColor,
    }

    const createdAtDate = `Created ${dateFns.distanceInWords(
      Date.now(),
      list.createdAt
    )} ago`

    return (
      <Card className={classes.card}>
        <CardActionArea
          className={classes.card}
          component={Link}
          to={`/list/${list.listId}`}
        >
          <CardMedia
            className={classes.media}
            style={newStyle}
            src="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/1+yHgAHtAKYD9BncgAAAABJRU5ErkJggg==)"
          />
          <CardContent>
            <Typography className={classes.title} gutterBottom>
              {list.name}
            </Typography>
            <TextTruncate line={7} text={list.description} />
            <Typography>{createdAtDate}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    )
  }
}

ListSummary.propTypes = {
  list: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
}

const makeMapStateToProps = (initialState, ownProps) => {
  const { listId } = ownProps
  return ({ checklists: { listsById } }) => ({
    list: listsById[listId],
  })
}

export default connect(makeMapStateToProps)(withStyles(styles)(ListSummary))
