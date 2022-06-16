const { faker } = require('@faker-js/faker/locale/en')
const random = require('random')
const t = require('tap')
const { getUser, removeUser } = require('../../lib/user-util')

const numEntriesPoisson = random.poisson(7)
const numWordsPoisson = random.poisson(4)

const httpClient = require('../../lib/http-client')

const testLists = [
  { name: 'List One', description: 'First Description' },
  {
    name: 'Second List',
    description: 'Second Description'
  }
]

t.beforeEach(async t => {
  t.context.user = await getUser()
})

t.teardown(removeUser)

t.afterEach(async t => {
  const lists = (await httpClient.get('')).data
  await Promise.all(lists, list => httpClient.delete(`/${list.listId}`))
})

t.test('no lists are returned', async t => {
  const emptyGetResponse = await httpClient.get('')
  t.equal(emptyGetResponse.status, 200)
  t.equal(emptyGetResponse.data.length, 0)
})

t.test('lists can be added', async t => {
  const response = await httpClient.post('', testLists[0])
  const { data, status } = response
  t.equal(status, 201)
  const userId = t.context.user.userId
  t.match(data, { ...testLists[0], userId })
  t.ok(data.createdAt)
  const listId1 = data.listId
  t.ok(listId1)
  await httpClient.post('', testLists[1])

  const lists = (await httpClient.get('')).data.sort((a, b) => (a.name > b.name ? 1 : -1))
  t.equal(lists.length, 2)
  const listId2 = lists[1].listId

  t.test('checklists can be read by ID', async t => {
    const response = await httpClient.get(`/${listId2}`)
    const { data, status } = response
    t.equal(status, 200)
    t.match(data, testLists[1])
    t.equal(data.listId, listId2)
  })

  t.test('checklist can be updated', async t => {
    const newName = 'New List Name'
    const newDescription = 'New Description'

    await httpClient.put(`/${listId1}`, {
      name: newName,
      description: newDescription
    })
    const { data } = await httpClient.get(`/${listId1}`)
    t.equal(data.name, newName)
    t.equal(data.description, newDescription)
  })

  t.test('checklist can be deleted', async t => {
    const { status } = await httpClient.delete(`/${listId1}`)
    t.equal(status, 200)
    const { data } = await httpClient.get('')
    t.match(data, testLists.slice(1))
  })

  const entries = [...new Array(9)].map((val, idx) => ({ title: `Entry ${idx + 1}` }))

  t.test('entries can be added', async t => {
    const results = await Promise.all(entries.map(entry =>
      httpClient.post(`/${listId2}/entries`, entry)
    ))

    results.forEach(({ status, data: { entId } }) => {
      t.equal(status, 201)
      t.ok(entId)
    })

    let sortedEntries
    t.test('entries can be read back', async t => {
      const { status, data } = await httpClient.get(`/${listId2}/entries`)
      t.equal(status, 200)
      t.equal(Object.keys(data).length, entries.length)
      sortedEntries = entriesToArray(data).sort((a, b) =>
        a.title > b.title ? 1 : -1
      )
      t.match(sortedEntries, entries)
    })

    t.test('entry can be removed', async t => {
      const { status } = await httpClient.delete(
        `/${listId2}/entries/${sortedEntries[0].entId}`
      )
      t.equal(status, 200)

      const { data } = await httpClient.get(`/${listId2}/entries`)
      t.match(
        Object.values(data).sort((a, b) => (a.title > b.title ? 1 : -1)),
        entries.splice(1)
      )
    })

    t.test('entry can be updated', async t => {
      const newTitle = 'A changed title'
      const { status } = await httpClient.put(
        `/${listId2}/entries/${sortedEntries[1].entId}`,
        { title: newTitle, value: 'YES' }
      )
      t.equal(status, 200)

      const { data } = await httpClient.get(`/${listId2}/entries`)
      t.match(entriesToArray(data).sort((a, b) => (a.title > b.title ? 1 : -1)), [
        { ...sortedEntries[1], value: 'YES', title: newTitle },
        ...sortedEntries.splice(2)
      ])
    })
  })

  t.test('many entries can be added with varying title lengths', async t => {
    const numEntries = numEntriesPoisson()

    const entries = [...new Array(numEntries)].map(() => ({
      title: [...new Array(numWordsPoisson())]
        .map(() => faker.random.word())
        .join(' ')
    }))
    console.log('Adding entries', JSON.stringify(entries, null, '  '))
    await Promise.all(entries.map(entry =>
      httpClient.post(`/${listId2}/entries`, entry)
    ))
  })
})

function entriesToArray (entriesObj) {
  return Object.entries(entriesObj).map(([prop, value]) => ({
    entId: prop,
    ...value
  }))
}
