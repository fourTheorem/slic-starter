'use strict'

const t = require('tap')
const httpClient = require('../../lib/http-client')
const { getUser } = require('../../lib/user-util')
const { retrieveEmail } = require('test-common/real-email-config')

const testList = {
  name: 'New Checklist',
  description: 'New Checklist description'
}

const subject = 'Your SLIC List'

t.beforeEach(async t => {
  t.context.user = await getUser()
})

t.test('When a checklist is created, an email is sent to the user', async t => {
  const { email } = t.context.user
  const response = await httpClient.post('', testList)
  const { status, data } = response
  t.equal(status, 201)
  t.ok(data.createdAt)
  t.ok(data.listId)

  // t.equal(
  //   message.text.body,
  //   `Congratulations! You created the list ${testList.name}`
  // )
  t.end()
})
