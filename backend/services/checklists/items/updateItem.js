'use strict'

const { createResponse } = require('../../../lib/response')
const { processEvent } = require('../../lib/event-util')
const items = require('./items')

// TODO - Fix security problem - you can update someone else's list
async function main(event) {
  const { pathParameters, userId } = processEvent(event)
  const { id: listId, entId, value } = pathParameters
  return createResponse(items.updateItem({ entId, value }))
}

module.exports = { main }
