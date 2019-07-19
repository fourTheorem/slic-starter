'use strict'

const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId } = require('../../fixtures')

const received = {}

const collaboratorHandler = proxyquire(
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

test('collaboratorHandler adds collaborators to existing lists', async t => {
  const collaboratorUserId = 'collaborator123'
  const event = {
    detail: { userId, listId: 'list123', collaboratorUserId }
  }

  await collaboratorHandler.main(event)
  t.equal(received.addCollaboratorParams.userId, userId)
  t.equal(received.addCollaboratorParams.collaboratorUserId, collaboratorUserId)

  t.end()
})
