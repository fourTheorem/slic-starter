'use strict'
process.env.SLIC_STAGE = 'dev'
process.env.SLIC_NS_DOMAIN = 'localhost.localhost'
process.env.CODE_SECRET = 'p@ssw0rd'

const proxyquire = require('proxyquire')
const { test } = require('tap')
const Uuid = require('uuid')
const received = {}

const shareHandler = proxyquire('../../../services/sharing/share', {
  'slic-tools/email-util': {
    share: params => {
      sendEmail: (...args) => {
        received.shareParams = args
        return Promise.resolve()
      }
    }
  },

  'slic-tools/user-util': {
    share: params => {
      getUser: (...args) => {
        received.userParams = args
        return Promise.resolve()
      }
    }
  }
})

test('An email is sent when a list is shared', async t => {
  const payload = {
    email: 'email@example.com',
    listId: Uuid.v4(),
    listName: 'First Checklist',
    userId: Uuid.v4()
  }

  const result = await shareHandler.create(payload)
  t.ok(received.shareParams.body)
})
