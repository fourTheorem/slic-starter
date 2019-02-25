'use strict'

const Promise = require('bluebird')

const config = require('../../config')
const { test } = require('tap')

test('checklist tests', async t => {
  const {
    user: { userId },
    axiosClient
  } = await config()

  test('empty checklist set can be read', async t => {
    const response = await axiosClient.get('/checklist')
    t.equal(response.status, 200)
    t.same(response.data, [])
  })

  test('checklist can be added', async t => {
    const name = 'Test Checklist'
    const response = await axiosClient.post('/checklist', {
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
    const lists = (await axiosClient.get('/checklist')).data
    debugger
    await Promise.each(lists, list =>
      axiosClient.delete(`/checklist/${list.listId}`)
    )
  })
})
