'use strict'

const { createResponse } = require('slic-tools/response')
const share = require('./share')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  const { pathParameters, body, userId } = processEvent(event)
  const { id: listId } = pathParameters
  const { email, listName } = body

  return createResponse(share.create({ email, listId, listName, userId }), {
    successCode: 201
  })
}

module.exports = {
  main
}
