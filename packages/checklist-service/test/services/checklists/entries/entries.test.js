const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand
} = require('@aws-sdk/lib-dynamodb')
const { mockClient } = require('aws-sdk-client-mock')
const t = require('tap')
const { v4: uuid } = require('uuid')

process.env.CHECKLIST_TABLE_NAME = 'checklists'

const dynamoMock = mockClient(DynamoDBDocumentClient)

let putMetricArgs = []
let metricsFlushCallCount = 0
const entries = t.mock('../../../../services/checklists/entries/entries', {
  'aws-embedded-metrics': {
    createMetricsLogger: () => {
      return {
        putMetric: (...args) => { putMetricArgs.push([...args]) },
        flush: () => {
          metricsFlushCallCount += 1
          Promise.resolve({})
        }
      }
    },
    Unit: {
      Count: 'Count'
    }
  }
})

const userId = 'my-test-user'
const entId = uuid()
const listId = uuid()
const testEntries = [
  { entId: 'ent1', title: 'Entry One' },
  { entId: 'ent2', title: 'Entry Two' }
]
const testEntriesObj = testEntries.reduce((acc, { entId, ...rest }) => {
  acc[entId] = rest
  return acc
}, {})

t.beforeEach(async () => {
  await dynamoMock.reset()
  dynamoMock.resolves({})

  putMetricArgs = []
  metricsFlushCallCount = 0
})

t.test('add new list entry', async t => {
  const entry = {
    userId,
    listId,
    title: 'new entry',
    value: 'not done'
  }

  dynamoMock.on(UpdateCommand).resolvesOnce({
    Attributes: {
      entries: { ...testEntries }
    }
  })

  const res = await entries.addEntry(entry)

  t.equal(dynamoMock.send.callCount, 1)
  t.equal(dynamoMock.send.firstCall.args[0].input.TableName, process.env.CHECKLIST_TABLE_NAME)
  t.same(dynamoMock.send.firstCall.args[0].input.Key, {
    userId,
    listId
  })
  t.same(dynamoMock.send.firstCall.args[0].input.ExpressionAttributeValues[':entry'], {
    title: entry.title,
    value: entry.value
  })
  t.match(res, {
    title: entry.title,
    value: entry.value
  })
  t.ok(res.entId)

  t.same(putMetricArgs, [
    ['NumEntries', testEntries.length, 'Count'],
    ['EntryWords', 1, 'Count']
  ])
  t.equal(metricsFlushCallCount, 1)
})

t.test('List all entries', async t => {
  const list = {
    userId,
    listId
  }

  dynamoMock.on(GetCommand).resolvesOnce({
    Item: {
      userId,
      listId,
      name: 'Test List',
      createdAt: Date.now(),
      entries: testEntriesObj
    }
  })

  const response = await entries.listEntries(list)

  t.equal(dynamoMock.send.callCount, 1)
  t.equal(dynamoMock.send.firstCall.args[0].input.TableName, process.env.CHECKLIST_TABLE_NAME)
  t.same(dynamoMock.send.firstCall.args[0].input.Key, list)
  t.same(response, testEntriesObj)
})

t.test('Update entry', async t => {
  const entry = {
    listId,
    userId,
    entId,
    title: 'New Title',
    value: 'Complete'
  }
  const res = await entries.updateEntry(entry)

  t.equal(dynamoMock.send.callCount, 1)
  t.equal(dynamoMock.send.firstCall.args[0].input.TableName, process.env.CHECKLIST_TABLE_NAME)
  t.match(dynamoMock.send.firstCall.args[0].input.ExpressionAttributeNames, {
    '#entId': entId
  })
  t.same(dynamoMock.send.firstCall.args[0].input.ExpressionAttributeValues, {
    ':title': entry.title,
    ':value': entry.value
  })
  t.same(dynamoMock.send.firstCall.args[0].input.Key, { userId, listId })
  t.match(res, {
    title: entry.title,
    value: entry.value,
    entId
  })

  t.same(putMetricArgs, [
    ['EntryWords', 1, 'Count']
  ])
  t.equal(metricsFlushCallCount, 1)
})

t.test('Delete Entry', async t => {
  const entry = {
    userId,
    entId,
    listId
  }
  await entries.deleteEntry(entry)

  t.equal(dynamoMock.send.callCount, 1)
  t.equal(dynamoMock.send.firstCall.args[0].input.TableName, process.env.CHECKLIST_TABLE_NAME)
  t.match(dynamoMock.send.firstCall.args[0].input.UpdateExpression, 'REMOVE')
  t.equal(dynamoMock.send.firstCall.args[0].input.ExpressionAttributeNames['#entId'], entId)
  t.same(dynamoMock.send.firstCall.args[0].input.Key, { userId, listId })
})
