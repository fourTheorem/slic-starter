const proxyquire = require('proxyquire')
const { test } = require('tap')
const { v4: uuid } = require('uuid')

const { userId, userRequestContext, commonEventProps } = require('../../fixtures')
const { createCode } = require('../../../lib/invitation')('p@ssw0rd')

const params = {
  listName: 'A Test List',
  listId: uuid(),
  userId,
  email: 'email@example.com'
}

const received = {}

const confirmHandler = proxyquire('../../../services/sharing/confirm', {
  'slic-tools/event-dispatcher': {
    dispatchEvent: (...args) => {
      received.eventArgs = args
      return Promise.resolve()
    }
  },
  './share': {
    confirm: (...args) => {
      if (args[0].code === 'error') {
        throw new Error('test error')
      }
      received.confirmParams = args
      return Promise.resolve()
    },
    '@noCallThru': true
  }
})

test('An invitation can be confirmed', async t => {
  const code = createCode(params)
  const pathParameters = {
    code
  }
  const event = {
    ...commonEventProps,
    requestContext: userRequestContext,
    pathParameters
  }

  await confirmHandler.main(event, {}, () => {})

  t.ok(received.confirmParams[0].userId, userId)
  t.ok(received.confirmParams[0].code, code)
  t.end()
})
