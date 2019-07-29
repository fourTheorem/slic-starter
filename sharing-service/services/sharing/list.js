const share = require('./share')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  const { pathParameters, userId } = processEvent(event)
  const { listId } = pathParameters
  const result = await share.list({ listId, userId })
  return {
    statusCode: 201,
    body: result
  }
}

module.exports = {
  main
}
