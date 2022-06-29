const {
  CloudWatchEventsClient,
  PutEventsCommand
} = require('@aws-sdk/client-cloudwatch-events')
const { captureAWSv3Client } = require('aws-xray-sdk-core')

const log = require('./log')
const { name: serviceName } = require('./service-info')

const cwEvents = new CloudWatchEventsClient({
  endpoint: process.env.EVENTS_ENDPOINT_URL
})

/* istanbul ignore next */
const cwEventsClient = process.env.IS_OFFLINE ? cwEvents : captureAWSv3Client(cwEvents) // TODO Re-enable X-Ray always

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
  await cwEventsClient.send(new PutEventsCommand(params))
}

module.exports = {
  dispatchEvent
}
