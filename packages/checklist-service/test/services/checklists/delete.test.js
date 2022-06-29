const t = require('tap')
const { v4: uuid } = require('uuid')

const { userId, userRequestContext } = require('../../fixtures')

let deleteParams = {}
const deleteHandler = t.mock('../../../services/checklists/delete', {
  '../../../services/checklists/checklist.js': {
    remove: params => {
      deleteParams = { ...params }
      return Promise.resolve()
    }
  }
})

t.beforeEach(async () => {
  deleteParams = {}
})

t.test('list handler executes checklist service', async t => {
  const listId = uuid()
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: listId
    }
  }

  const result = await deleteHandler.main(event)

  t.equal(deleteParams.listId, listId)
  t.equal(deleteParams.userId, userId)
  t.equal(result.statusCode, 200)
  t.same(JSON.parse(result.body), {})
})
