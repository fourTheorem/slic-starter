'use strict'

const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

const received = {}

const collabHandler = proxyquire(
  '../../../services/checklists/collaboratorHandler.js',
  {
    './checklist': {
      addCollaborator: params => {
        received.addCollaboratorParams = params
        return received
      }
    }
  }
)

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
    detail: { userId: 'user123', listId: 'list123', email: 'email@example.com' }
  }

  await collabHandler.main(event)
  t.equal(received.addCollaboratorParams.userId, userId)
  t.equal(received.addCollaboratorParams.collaboratorUserId, collaboratorUserId)

  t.end()
})
