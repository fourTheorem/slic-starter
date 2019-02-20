'use strict'
const proxyquire = require('proxyquire')

const { test } = require('tap')

const received = {}
const getHandler = proxyquire('../../../services/checklists/get', {
  './checklist.js': {
    get: params => {
      received.getParams = params
      return received
    }
  }
})

test('get handler gets checklists', async t => {
  const event = {
    requestContext: {
      identity: {
        cognitoIdentityId: 'testUser'
      }
    },
    pathParameters: {
      id: '1234'
    }
  }

  const result = await getHandler.main(event)

  t.ok(received.getParams.listId)
  t.ok(received.getParams.userId)
  t.end()
})
