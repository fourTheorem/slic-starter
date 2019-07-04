'use strict'

const awsXray = require('aws-xray-sdk')
const AWS = require('aws-sdk')
const cwEvents = awsXray.captureAWSClient(new AWS.CloudWatchEvents())

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

  await cwEvents.putEvents(params).promise()
}

module.exports = {
  createNewListEvent
}
