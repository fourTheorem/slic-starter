'use strict'

const proxyquire = require('proxyquire')
const { test } = require('tap')
const { userId, userRequestContext } = require('../../fixtures')
const uuid = require('uuid')

const received = {}

const payload = {
  email: 'email@example.com',
  listId: uuid.v4(),
  listName: 'First Checklist'
}

const createHandler = proxyquire('../../../services/sharing/create', {
  './share': {
    create: (...args) => {
      received.createParams = args
      return Promise.resolve()
    },
    '@noCallThru': true
  }
})

test('A checklist can be shared with another user', async t => {
  const event = {
    requestContext: userRequestContext,
    body: JSON.stringify(payload)
  }

  await createHandler.main(event, {}, () => {})
  t.equal(received.createParams[0].userId, userId)
  t.equal(received.createParams[0].email, payload.email)
  t.equal(received.createParams[0].listId, payload.listId)
  t.equal(received.createParams[0].listName, payload.listName)
})
