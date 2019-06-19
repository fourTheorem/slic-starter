const stage = process.env.SLIC_STAGE
let AWS
let cwEvents

if (stage == 'local') {
  AWS = require('aws-sdk')
} else {
  const awsXray = require('aws-xray-sdk')
  AWS = require('aws-sdk')
  cwEvents = awsXray.captureAWSClient(new AWS.CloudWatchEvents())
}

async function createNewListEvent(list) {
  if (stage == 'local') {
    return 'using local cloudwatch events'
  }

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
