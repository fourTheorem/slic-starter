'use strict'

const proxyquire = require('proxyquire')
const { test } = require('tap')
const uuid = require('uuid')

const { userId } = require('../../fixtures')

process.env.EMAIL_QUEUE_NAME = 'test-email-queue'
process.env.SLIC_STAGE = 'dev'
process.env.SLIC_NS_DOMAIN = 'localhost.localhost'
process.env.CODE_SECRET = 'p@ssw0rd'

const { createCode } = require('../../../lib/invitation')(
  process.env.CODE_SECRET
)

const testUser = {
  userId,
  email: 'userId@example.com'
}
const listName = 'A Test List'

const received = {}

const shareService = proxyquire('../../../services/sharing/share', {
  'slic-tools/email-util': {
    sendEmail: (...args) => {
      received.sendEmailParams = args
      return Promise.resolve()
    },
    '@noCallThru': true
  },
  'slic-tools/user-util': {
    getUser: (...args) => {
      received.getUserParams = args
      return Promise.resolve(testUser)
    },
    '@noCallThru': true
  },
  'slic-tools/event-dispatcher': {
    dispatchEvent: (...args) => {
      received.dispatchEventParams = args
      return Promise.resolve()
    }
  }
})

test('An email is sent when a list is shared', async t => {
  const payload = {
    ...testUser,
    listId: uuid.v4(),
    listName
  }

  await shareService.create(payload)
  t.match(received.sendEmailParams[0].to, testUser.email)
  t.ok(received.sendEmailParams[0].subject)
  t.ok(received.sendEmailParams[0].body.indexOf(payload.listName) > -1)
})

test('An event is dispatched when a code is confirmed', async t => {
  const params = {
    listName,
    userId,
    email: 'invitee@example.com',
    listId: uuid.v4()
  }
  const code = createCode(params)

  const collaboratorUserId = uuid.v4()
  await shareService.confirm({ code, userId: collaboratorUserId })
  t.same(received.dispatchEventParams, [
    'COLLABORATOR_ACCEPTED_EVENT',
    {
      listId: params.listId,
      sharedListOwner: userId,
      userId: collaboratorUserId
    }
  ])
})

test('An error is thrown when an invalid code is provided', async t => {
  const code = 'blah'

  try {
    await shareService.confirm({ code, userId: uuid.v4() })
    t.fail('Error excepted for invalid code')
  } catch (err) {
    t.equal(err.statusCode, 400)
  }
  t.end()
})
