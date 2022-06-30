const { v4: uuid } = require('uuid')
const t = require('tap')

const userId = uuid()
const testUser = {
  userId,
  email: 'test-user@example.com'
}

let getUserArgs = []
let sendEmailArgs = []

const checklistHandler = t.mock('../../../services/welcome/new-checklist-handler', {
  'slic-tools/user-util': {
    getUser: (...args) => {
      getUserArgs = [...args]
      return Promise.resolve(testUser)
    }
  },
  'slic-tools/email-util': {
    sendEmail: (...args) => {
      sendEmailArgs = [...args]
      return Promise.resolve()
    }
  }
})

t.beforeEach(async () => {
  getUserArgs = []
  sendEmailArgs = []
})

t.test('handleNewChecklist sends an email message', async t => {
  const event = {
    detail: {
      userId,
      name: 'New Checklist'
    }
  }
  const ctx = {
    userServiceUrl: 'http://user-service.example.com'
  }

  await checklistHandler.handleNewChecklist(event, ctx)

  t.same(getUserArgs, [userId, ctx.userServiceUrl])
  t.match(sendEmailArgs, [
    {
      to: testUser.email,
      subject: 'Your SLIC List',
      body: new RegExp(`.*${event.detail.name}$`)
    }
  ])
})
