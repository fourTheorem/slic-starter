const AWS = require('aws-sdk')
const cwEvents = new AWS.CloudWatchEvents()
const { createResponse } = require('../lib/response')

async function createNewListEvent(list) {
  const params = {
    Entries: [
      {
        Detail: JSON.stringify(list),
        DetailType: 'LIST_CREATED_EVENT',
        Source: 'sliclists.checklist'
      }
    ]
  }

  const result = await cwEvents.putEvents(params).promise()
}

module.exports = {
  createNewListEvent
}
