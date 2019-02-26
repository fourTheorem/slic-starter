'use strict'

const { createResponse } = require('../../../lib/response')
const items = require('./items')
const { processEvent } = require('../../lib/event-util')

async function main(event) {
  const { body, pathParameters, userId } = processEvent(event)
  const { title, value } = body
  const { id: listId } = pathParameters

  return createResponse(items.addItem({ userId, listId, title, value }), {
    successCode: 201
  })
}

module.exports = { main }
