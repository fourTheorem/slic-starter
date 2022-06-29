const {
  CloudWatchEventsClient,
  PutEventsCommand
} = require('@aws-sdk/client-cloudwatch-events')
const { mockClient } = require('aws-sdk-client-mock')
const t = require('tap')

const { dispatchEvent } = require('../event-dispatcher')

const cwEventsMock = mockClient(CloudWatchEventsClient)

t.beforeEach(async () => {
  cwEventsMock.reset()
  cwEventsMock.on(PutEventsCommand).resolves({})
})

t.test('dispatchEvent dispatches a CloudWatch custom event', async t => {
  const type = 'LIST_CREATED_EVENT'
  const testList = {
    name: 'Test List',
    userId: 'user123'
  }

  const expectedInput = {
    Entries: [
      {
        Detail: JSON.stringify(testList),
        DetailType: type,
        Source: 'default-service'
      }
    ]
  }

  await dispatchEvent(type, testList)

  t.equal(cwEventsMock.send.callCount, 1)
  t.same(cwEventsMock.send.firstCall.args[0].input, expectedInput)
})
