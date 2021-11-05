'use strict'

const awsXray = require('aws-xray-sdk-core')
const { AWS } = require('./aws')
const cwEventsCore = new AWS.CloudWatchEvents({ endpoint: process.env.EVENTS_ENDPOINT_URL })
/* istanbul ignore next */
const cwEvents = process.env.IS_OFFLINE ? cwEventsCore : awsXray.captureAWSClient(cwEventsCore) // TODO Re-enable X-Ray always
const log = require('./log')
const { name: serviceName } = require('./service-info')

async function dispatchEvent (type, detail) {
  const params = {
    Entries: [
      {
        Detail: JSON.stringify(detail),
        DetailType: type,
        Source: serviceName
      }
    ]
  }
  log.info({ params }, 'Sending EventBridge event')
  await cwEvents.putEvents(params).promise()
}

module.exports = {
  dispatchEvent
}
