'use strict'
const proxyquire = require('proxyquire')

const { test } = require('tap')

const received = {}
const listHandler = proxyquire('../../../services/checklists/list', {
  './checklist.js': {
    list: params => {
      received.listParams = params
      return received
    }
  }
})

test('list handler executes checklist service', async t => {
  const event = {
    requestContext: {
      identity: {
        cognitoIdentityId: 'testUser'
      }
    }
  }

  const result = await listHandler.main(event)
  t.equals(
    received.listParams.userId,
    event.requestContext.identity.cognitoIdentityId
  )

  t.end()
})
