'use strict'

const Promise = require('bluebird')
const { test } = require('tap')
const { getUser, removeUser } = require('../../lib/user-util')

const httpClient = require('../../lib/http-client')

const testLists = [{ name: 'List One' }, { name: 'Second List' }]

test('checklist tests', async t => {
  const { userId } = await getUser()

  test('empty checklist set can be read', async t => {
    const response = await httpClient.get('/checklist')
    t.equal(response.status, 200)
    t.same(response.data, [])
  })

  let listId1, listId2
  test('checklists can be added', async t => {
    const response = await httpClient.post('/checklist', testLists[0])

    const { data, status } = response
    t.equal(status, 201)
    t.match(data, { ...testLists[0], userId })
    t.ok(data.createdAt)
    const { listId } = data
    t.ok(listId)
    listId1 = data.listId

    const { data: data2 } = await httpClient.post('/checklist', testLists[1])
    listId2 = data2.listId

    const { data: lists } = await httpClient.get('/checklist')
    t.match(lists.sort((a, b) => (a.name > b.name ? 1 : -1)), testLists)
  })

  test('checklists can be read by ID', async t => {
    const { data, status } = await httpClient.get(`/checklist/${listId2}`)
    t.equal(status, 200)
    t.match(data, testLists[1])
    t.equal(data.listId, listId2)
  })

  test('checklist can be updated', async t => {
    const newName = 'New List Name'
    const { status } = await httpClient.put(`/checklist/${listId1}`, {
      name: newName
    })
    t.equal(status, 200)
    const { data } = await httpClient.get(`/checklist/${listId1}`)
    t.equal(data.name, newName)
  })

  test('checklist can be deleted', async t => {
    const { status } = await httpClient.delete(`/checklist/${listId1}`)
    t.equal(status, 200)
    const { data } = await httpClient.get('/checklist')
    t.match(data, testLists.slice(1))
  })

  const entries = [...new Array(9)].map((val, idx) => ({
    title: `Entry ${idx + 1}`
  }))

  test('entries can be added', async t => {
    const results = await Promise.map(entries, entry =>
      httpClient.post(`/checklist/${listId2}/entries`, entry)
    )
    results.forEach(({ status, data: { entId } }) => {
      t.equal(status, 201)
      t.ok(entId)
    })
  })

  let sortedEntries
  test('entries can be read back', async t => {
    const { status, data } = await httpClient.get(
      `/checklist/${listId2}/entries`
    )
    t.equal(status, 200)
    t.equal(Object.keys(data).length, entries.length)
    sortedEntries = entriesToArray(data).sort(
      (a, b) => (a.title > b.title ? 1 : -1)
    )
    t.match(sortedEntries, entries)
  })

  test('entry can be removed', async t => {
    const { status } = await httpClient.delete(
      `/checklist/${listId2}/entries/${sortedEntries[0].entId}`
    )
    t.equal(status, 200)

    const { data } = await httpClient.get(`/checklist/${listId2}/entries`)
    t.match(
      Object.values(data).sort((a, b) => (a.title > b.title ? 1 : -1)),
      entries.splice(1)
    )
  })

  test('entry can be updated', async t => {
    const newTitle = 'A changed title'
    const { status } = await httpClient.put(
      `/checklist/${listId2}/entries/${sortedEntries[1].entId}`,
      { title: newTitle, value: 'YES' }
    )
    t.equal(status, 200)

    const { data } = await httpClient.get(`/checklist/${listId2}/entries`)
    t.match(entriesToArray(data).sort((a, b) => (a.title > b.title ? 1 : -1)), [
      { ...sortedEntries[1], value: 'YES', title: newTitle },
      ...sortedEntries.splice(2)
    ])
  })

  test('tear down - delete checklist', async t => {
    const lists = (await httpClient.get('/checklist')).data
    await Promise.each(lists, list =>
      httpClient.delete(`/checklist/${list.listId}`)
    )
  })

  test('tear down - delete user', async () => {
    await removeUser()
  })
})

function entriesToArray(entriesObj) {
  return Object.entries(entriesObj).map(([prop, value]) => ({
    entId: prop,
    ...value
  }))
}
