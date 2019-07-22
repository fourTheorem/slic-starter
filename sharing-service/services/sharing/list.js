const { createResponse } = require('slic-tools/response')

const share = require('./share')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  const { userId } = processEvent(event)
  return createResponse(share.list({ listId, userId }))
}

module.exports = {
  main
}
