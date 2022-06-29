const t = require('tap')
const { v4: uuid } = require('uuid')

const { userRequestContext, userId } = require('../../../fixtures')

let listEntriesParams = {}
let listEntriesReturnVal = {}
const listEntriesHandler = t.mock('../../../../services/checklists/entries/list', {
  '../../../../services/checklists/entries/entries.js': {
    listEntries: params => {
      listEntriesParams = { ...params }
      return Promise.resolve(listEntriesReturnVal)
    }
  }
})

t.beforeEach(async () => {
  listEntriesParams = {}
  listEntriesReturnVal = {}
})

t.test('list entry handler lists entries contained in a checklists', async t => {
  const listId = uuid()
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: listId
    }
  }
  listEntriesReturnVal = { entries: { [uuid()]: { title: 'test-title', value: 'test-val' } } }

  const result = await listEntriesHandler.main(event)

  t.equal(listEntriesParams.listId, listId)
  t.equal(listEntriesParams.userId, userId)
  t.equal(result.statusCode, 200)
  t.same(JSON.parse(result.body), listEntriesReturnVal)
})
