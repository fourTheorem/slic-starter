'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')
const { userId, userRequestContext } = require('../../fixtures')
const Uuid = require('uuid')

const received = {}

const payload = {
  email: 'email@example.com',
  listId: Uuid.v4(),
  listName: 'First Checklist'
}

const createHandler = proxyquire('../../../services/sharing/create', {
  './share': {
    create: params => {
      received.createParams = params
      return received
    }
  }
})

test('A checklist can be shared with another user', async t => {
  const event = {
    requestContext: userRequestContext,
    body: JSON.stringify(payload)
  }

  const result = await createHandler.main(event)
  t.equal(received.createParams.userId, userId)
  t.equal(received.createParams.email, payload.email)
  t.equal(received.createParams.listId, payload.listId)
  t.equal(received.createParams.listName, payload.listName)
  t.equal(result.statusCode, 201)
})
