'use strict'

const { getUser, removeUser } = require('../../lib/user-util')
const Promise = require('bluebird')
const { test } = require('tap')
const httpClient = require('../../lib/http-client')
const Mailosaur = require('mailosaur')
const client = new Mailosaur(process.env.MAILOSAUR_API_KEY)

const testList = {
  name: 'New Checklist',
  description: 'New Checklist description'
}

test('Welcome tests', async t => {
  const { userId } = await getUser()

  test('When a checklist is created, an email is sent to the user', async t => {
    const response = await httpClient.post('/checklist', testList)
    const { status, data } = response
    t.equal(status, 201)
    t.ok(data.createdAt)
    t.ok(data.listId)

    let content

    const email = await client.messages
      .list(process.env.MAILOSAUR_SERVER_ID)
      .then(result => {
        console.log('Result: ', result)
        content = result
      })

    t.ok(content)
  })
})
