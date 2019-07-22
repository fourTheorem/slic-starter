'use strict'
const uuid = require('uuid')
const proxyquire = require('proxyquire')
const { test } = require('tap')
const { userId, userRequestContext } = require('../../fixtures')

const received = {}
const payload = {
  email: 'email@example.com',
  listId: uuid.v4(),
  listName: uuid.v4()
}

const createHandler = proxyquire('../../../services/sharing/create', {
  './share': {
    create: params => {
      received.createParams = params
      return received
    }
  }
})

test('create handler creates new share request', async t => {
  const event = {
    requestContext: userRequestContext,
    body: JSON.stringify(payload)
  }

  const result = await createHandler.main(event)

  t.equal(received.createParams.userId, userId)
  t.equal(received.createParams.email, payload.email)
  t.equal(received.createParams.listId, payload.listId)
  t.equal(received.createParams.listName, payload.listName)
})
