const AWS = require('aws-sdk')
const cwEvents = new AWS.CloudWatchEvents()

async function createNewListEvent(list) {
  const params = {
    Entries: [
      {
        Detail: '{ "key1": "value1", "key2": "value2" }',
        DetailType: 'appRequestSubmitted',
        Source: 'com.company.app'
      }
    ]
  }

  const result = await cwEvents.putEvents(params).promise()
  console.log('Sent event', result)
}

module.exports = {
  createNewListEvent
}
