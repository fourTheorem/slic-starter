'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')
const { userId, userRequestContext } = require('../../fixtures')
const Uuid = require('uuid')
const { createCode } = require('../../../lib/invitation')('p@ssw0rd')

const params = {
  listId: Uuid.v4(),
  userId: Uuid.v4(),
  email: 'email@example.com'
}

const received = {}

const code = createCode(params)
const payload = {
  code: code
}

const confirmHandler = proxyquire('../../../services/sharing/confirm', {
  'slic-tools/event-dispatcher': {
    dispatchEvent: (...args) => {
      received.eventArgs = args
      return Promise.resolve()
    }
  }
})

test('An event is dispatched when a code is confirmed', async t => {
  const event = {
    requestContext: userRequestContext,
    body: JSON.stringify(payload)
  }

  const result = await confirmHandler.main(event)
  console.log({ result }, 'result info')
  console.log({ received }, 'received info')
  t.ok(received.eventArgs)
})
