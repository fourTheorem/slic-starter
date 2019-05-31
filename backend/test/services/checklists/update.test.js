'use strict'

const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

const received = {}

const updateHandler = proxyquire('../../../services/checklists/update', {
  './checklist.js': {
    update: params => {
      received.updateParams = params
      return received
    }
  }
})

test('update handler updates current checklist', async t => {
  const payload = {
    name: 'checklist name',
    description: 'Checklist Description'
  }
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: '1234'
    },
    body: JSON.stringify(payload)
  }

  const result = await updateHandler.main(event)
  t.match(result, {
    statusCode: 200
  })
  t.equal(received.updateParams.userId, userId)
  t.equal(received.updateParams.name, payload.name)
  t.equal(received.updateParams.description, payload.description)
  t.notEqual(received.updateParams.name, null)
  t.notEqual(received.updateParams.description, null)

  t.end()
})
