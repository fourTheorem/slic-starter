'use strict'

const path = require('path')
const proxyquire = require('proxyquire')
const awsMock = require('aws-sdk-mock')
awsMock.setSDK(path.resolve('../node_modules/aws-sdk'))

const { test } = require('tap')

const userId = 'ownerA'

process.env.CHECKLIST_TABLE_NAME = 'checklists'

const list1 = {
  userId: 'ownerA',
  listId: 'list1',
  name: 'List One',
  description: 'List One Description',
  entries: {},
}
const testLists = {
  ownerA: [
    list1,
    {
      userId: 'ownerA',
      listId: 'list2',
      name: 'List Two',
      description: 'List Two Description',
      entries: {},
    },
  ],
  ownerB: [
    {
      userId: 'ownerB',
      listId: 'list3',
      name: 'List Three',
      description: 'List three Description',
      entries: {},
    },

    {
      userId: 'ownerB',
      listId: 'list1',
      sharedListOwner: 'ownerA',
    },
  ],
}

const received = {
  dynamoDb: {},
}

awsMock.mock('DynamoDB.DocumentClient', 'put', function (params, callback) {
  received.dynamoDb.put = params
  callback(null, { ...params })
})

awsMock.mock('DynamoDB.DocumentClient', 'update', function (params, callback) {
  received.dynamoDb.update = params
  callback(null, { ...params })
})

awsMock.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
  received.dynamoDb.get = params
  const userId = params.Key.userId
  const listId = params.Key.listId
  callback(null, {
    Item: testLists[userId].find(list => list.listId === listId),
  })
})

awsMock.mock('DynamoDB.DocumentClient', 'batchGet', function (
  params,
  callback
) {
  callback(null, { Responses: { checklists: [list1] } })
})

awsMock.mock('DynamoDB.DocumentClient', 'delete', function (params, callback) {
  received.dynamoDb.delete = params
  callback(null, { ...params })
})

awsMock.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
  received.dynamoDb.query = params
  const userId = params.ExpressionAttributeValues[':userId']
  callback(null, {
    Items: testLists[userId],
  })
})

test('create puts a dynamodb item', async t => {
  const record = {
    userId,
    name: 'Test List',
    description: 'Test Description',
  }

  const checklist = proxyquire('../../../services/checklists/checklist', {
    'slic-tools/event-dispatcher': {
      dispatchEvent: (...args) => {
        received.eventArgs = args
        return Promise.resolve()
      },
    },
  })

  const response = await checklist.create(record)
  t.equal(received.dynamoDb.put.Item.userId, userId)
  t.equal(received.dynamoDb.put.Item.name, record.name)
  t.ok(received.dynamoDb.put.Item.createdAt)
  t.ok(received.dynamoDb.put.Item.listId)
  t.same(received.dynamoDb.put.Item.entries, {})

  t.match(received.eventArgs[1], record)

  t.equal(received.dynamoDb.put.Item.description, record.description)
  t.match(response, record)

  t.end()
})

test('update function updates current checklists', async t => {
  const record = {
    listId: '1234',
    userId,
    name: 'New title',
    description: 'New Description',
  }

  const checklist = require('../../../services/checklists/checklist')

  await checklist.update(record)
  t.ok(received.dynamoDb.update.ExpressionAttributeValues[':name'])
  t.ok(received.dynamoDb.update.ExpressionAttributeValues[':description'])
  t.ok(received.dynamoDb.update.ExpressionAttributeValues[':updatedAt'])
  t.equal(received.dynamoDb.update.Key.userId, record.userId)
  t.equal(received.dynamoDb.update.Key.listId, record.listId)
  t.end()
})

test('update function updates current checklists when name not specified', async t => {
  const record = {
    listId: '1234',
    userId,
  }

  const checklist = require('../../../services/checklists/checklist')

  await checklist.update(record)

  t.equal(received.dynamoDb.update.ExpressionAttributeValues[':name'], null)
  t.equal(
    received.dynamoDb.update.ExpressionAttributeValues[':description'],
    null
  )
  t.ok(received.dynamoDb.update.ExpressionAttributeValues[':updatedAt'])
  t.equal(received.dynamoDb.update.Key.userId, record.userId)
  t.equal(received.dynamoDb.update.Key.listId, record.listId)
  t.end()
})

test('Get a checklist based on a listId and userId', async t => {
  const record = {
    listId: list1.listId,
    userId: list1.userId,
  }

  const checklist = require('../../../services/checklists/checklist')

  const response = await checklist.get(record)
  t.same(response, list1)
  t.equal(received.dynamoDb.get.Key.listId, record.listId)
  t.equal(received.dynamoDb.get.Key.userId, record.userId)

  t.end()
})

test('remove a checklist', async t => {
  const checklist = require('../../../services/checklists/checklist')

  const record = {
    listId: '1234',
    userId,
  }

  await checklist.remove(record)

  t.equal(received.dynamoDb.delete.Key.userId, record.userId)
  t.equal(received.dynamoDb.delete.Key.listId, record.listId)
  t.end()
})

test('list all checklists', async t => {
  const checklist = require('../../../services/checklists/checklist')

  const record = {
    userId,
  }

  const response = await checklist.list(record)

  t.same(response, testLists[userId])
  t.equal(
    received.dynamoDb.query.ExpressionAttributeValues[':userId'],
    record.userId
  )

  t.end()
})

test('list all checklists including shared lists', async t => {
  const checklist = require('../../../services/checklists/checklist')

  const record = {
    userId: 'ownerB',
  }

  const response = await checklist.list(record)

  t.match(response, testLists['ownerB'])

  const shared = response.find(share => share.sharedListOwner)

  const originalList = testLists['ownerB'].find(
    list => list.listId === shared.listId
  )

  t.equal(shared.name, originalList.name)
  t.equal(shared.description, originalList.description)

  t.end()
})

test('add a collaborator', async t => {
  const checklist = require('../../../services/checklists/checklist')

  const record = {
    sharedListOwner: 'list-owner',
    listId: 'list-shared',
    userId,
  }

  await checklist.addCollaborator(record)

  t.equal(received.dynamoDb.put.Item.listId, record.listId)
  t.equal(received.dynamoDb.put.Item.userId, record.userId)
  t.equal(received.dynamoDb.put.Item.sharedListOwner, record.sharedListOwner)

  t.end()
})
