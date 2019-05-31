'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

const received = {}
const payload = {
  name: 'hello',
<<<<<<< 313a7e8b363e1a1eb0938454061537bb66a5c9cf
  description: 'New Description'
=======
  description: 'New Description',
  category: 'TODO'
>>>>>>> Update E2E, Integration and Unit Tests for Category Functionality
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
  t.equal(received.createParams.category, payload.category)
  t.equal(result.statusCode, 201)

  t.end()
})
