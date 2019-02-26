'use strict'

const Promise = require('bluebird')
const { test } = require('tap')
const { getUser } = require('../../lib/user-util')

const httpClient = require('../../lib/http-client')

test('checklist tests', async t => {
  const { userId } = await getUser()

  test('empty checklist set can be read', async t => {
    const response = await httpClient.get('/checklist')
    t.equal(response.status, 200)
    t.same(response.data, [])
  })

  test('checklist can be added', async t => {
    const name = 'Test Checklist'
    const response = await httpClient.post('/checklist', {
      name
    })

    const { data, status } = response
    t.equal(status, 201)
    t.match(data, { name, userId })
    t.ok(data.createdAt)
    const { listId } = data
    t.ok(listId)
  })

  test('tear down', async t => {
    const lists = (await httpClient.get('/checklist')).data
    await Promise.each(lists, list =>
      httpClient.delete(`/checklist/${list.listId}`)
    )
  })
})
