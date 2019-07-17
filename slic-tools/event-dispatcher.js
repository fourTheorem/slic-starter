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

async function createShareAcceptedEvent(userId, listId, email) {
  const details = {
    userId,
    listId,
    email
  }
  const params = {
    Entries: [
      {
        Detail: JSON.stringify(details),
        DetailType: 'COLLABORATOR_ACCEPTED_EVENT',
        Source: 'sliclists.sharing'
      }
    ]
  }

  await cwEvents.putEvents(params).promise()
}

module.exports = {
  createNewListEvent,
  createShareAcceptedEvent
}
