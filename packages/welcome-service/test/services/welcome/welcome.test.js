const { v4: uuid } = require('uuid')

const proxyquire = require('proxyquire').noPreserveCache()
const { test } = require('tap')

const userId = uuid()
const testUser = {
  userId,
  email: 'test-user@example.com'
}

const received = {}

test('handleNewChecklist sends an email message', async t => {
  const event = {
    detail: {
      userId,
      name: 'New Checklist'
    }
  }

  const checklistHandler = proxyquire(
    '../../../services/welcome/new-checklist-handler',
    {
      'slic-tools/user-util': {
        getUser: () => Promise.resolve(testUser),
        '@noCallThru': true
      },
      'slic-tools/email-util': {
        sendEmail: (...args) => {
          received.sendEmailArgs = args
          return Promise.resolve()
        },
        '@noCallThru': true
      }
    }
  )

  await checklistHandler.handleNewChecklist(event, {})
  t.match(received.sendEmailArgs[0], {
    to: testUser.email,
    subject: 'Your SLIC List'
  })
  t.ok(received.sendEmailArgs[0].body)
  t.end()
})
