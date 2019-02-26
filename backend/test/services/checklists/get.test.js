'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

const received = {}
const getHandler = proxyquire('../../../services/checklists/get', {
  './checklist': {
    get: params => {
      received.getParams = params
      return received
    }
  }
})

test('get handler gets checklists', async t => {
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: '1234'
    }
  }

  const result = await getHandler.main(event)

  t.equal(received.getParams.listId, event.pathParameters.id)
  t.equal(received.getParams.userId, userId)
  t.equal(result.statusCode, 200)
  t.end()
})
