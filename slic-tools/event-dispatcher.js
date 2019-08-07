'use strict'

const awsXray = require('aws-xray-sdk')
const AWS = require('aws-sdk')
const cwEvents = awsXray.captureAWSClient(
  new AWS.CloudWatchEvents({ endpoint: process.env.EVENTS_ENDPOINT_URL })
)

const { name: serviceName } = require('./service-info')

async function dispatchEvent(type, detail) {
  const params = {
    Entries: [
      {
        Detail: JSON.stringify(detail),
        DetailType: type,
        Source: serviceName
      }
    ]
  }

  await cwEvents.putEvents(params).promise()
}

module.exports = {
  dispatchEvent
}
