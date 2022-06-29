const t = require('tap')
const { v4: uuid } = require('uuid')

const { userId, userRequestContext } = require('../../../fixtures')

let deleteEntryParams = {}
const deleteEntryHandler = t.mock('../../../../services/checklists/entries/delete', {
  '../../../../services/checklists/entries/entries.js': {
    deleteEntry: params => {
      deleteEntryParams = { ...params }
      return Promise.resolve()
    }
  }
})

t.beforeEach(async () => {
  deleteEntryParams = {}
})

t.test('delete entry handler removes entries from checklists', async t => {
  const listId = uuid()
  const entryId = uuid()
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: listId,
      entId: entryId
    }
  }

  const result = await deleteEntryHandler.main(event)

  t.equal(deleteEntryParams.userId, userId)
  t.equal(deleteEntryParams.listId, listId)
  t.equal(deleteEntryParams.entId, entryId)
  t.equal(result.statusCode, 200)
  t.same(JSON.parse(result.body), {})
})
