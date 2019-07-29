const { createResponse } = require('slic-tools/response')

const share = require('./share')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  const { pathParameters, userId } = processEvent(event)
  const { listId } = pathParameters
  return createResponse(share.list({ listId, userId }))
}

module.exports = {
  main
}
