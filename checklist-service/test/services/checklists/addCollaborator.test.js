'use strict'

const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

const received = {}

const collabHandler = proxyquire('../../../services/checklists/collaboratorHandler.js', {
  './checklist.js': {
    addCollaboratorToList: params => {
      received.updateParams = params
      return received
    }
  }
})

test('collabHandler adds collaborators to existing lists', async t => {
  const payload = {
    collaborators: {}
  }
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: '1234'
    },
    body: JSON.stringify(payload),
    detail:{userId: 'user123', listId: 'list123', email: 'email@example.com'}
  }

  const result = await collabHandler.main(event)
  console.log('result is: ', result)
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
