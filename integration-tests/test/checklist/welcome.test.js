'use strict'

const { test } = require('tap')
const httpClient = require('../../lib/http-client')
const { getUser } = require('../../lib/user-util')
const { retrieveEmail } = require('test-common/real-email-config')

const testList = {
  name: 'New Checklist',
  description: 'New Checklist description'
}

const subject = 'Your SLIC List'

test('Creating an email result in a welcome email being received', async t => {
  const { email } = await getUser()

  test('When a checklist is created, an email is sent to the user', async t => {
    const response = await httpClient.post('', testList)
    const { status, data } = response
    t.equal(status, 201)
    t.ok(data.createdAt)
    t.ok(data.listId)

    const message = await retrieveEmail(email, subject)

    t.equal(
      message.text.body,
      `Congratulations! You created the list ${testList.name}`
    )
    t.end()
  })
})
