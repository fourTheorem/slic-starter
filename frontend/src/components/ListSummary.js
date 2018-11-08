import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Card,
  CardActionArea,
  CardContent,
  Typography
} from '@material-ui/core'

class ListSummary extends Component {
  render() {
    const { list } = this.props

    return (
      <Card>
        <CardActionArea>
          <CardContent>
            <Typography variant="h2">{list.name}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    )
  }
}

ListSummary.propTypes = {
  list: PropTypes.object.isRequired
}

const makeMapStateToProps = (initialState, ownProps) => {
  const { listId } = ownProps
  return ({ checklists: { listsById } }) => ({
    list: listsById[listId]
  })
}

export default connect(makeMapStateToProps)(ListSummary)
