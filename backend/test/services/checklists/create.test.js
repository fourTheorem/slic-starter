'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

const received = {}
const payload = {
  name: 'hello',
  description: 'New Description'
}

const createHandler = proxyquire('../../../services/checklists/create', {
  './checklist': {
    create: params => {
      received.createParams = params
      return received
    }
  }
})

test('create handler creates new checklists', async t => {
  const event = {
    requestContext: userRequestContext,
    body: JSON.stringify(payload)
  }

  const result = await createHandler.main(event)
  t.equal(received.createParams.userId, userId)
  t.equal(received.createParams.name, payload.name)
  t.equal(received.createParams.description, payload.description)
  t.equal(result.statusCode, 201)

  t.end()
})
