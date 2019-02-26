'use strict'

const { createResponse } = require('../../../lib/response')
const { processEvent } = require('../../lib/event-util')
const items = require('./items')

async function main(event) {
  const { pathParameters } = processEvent(event)
  const { id: listId } = pathParameters
  return createResponse(items.listItems({ listId }))
}

module.exports = { main }
