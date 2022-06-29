const t = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

let deleteParams = {}
const deleteHandler = t.mock('../../../services/checklists/delete', {
  '../../../services/checklists/checklist.js': {
    remove: params => {
      deleteParams = { ...params }
      return Promise.resolve(deleteParams)
    }
  }
})

t.beforeEach(async () => {
  deleteParams = {}
})

t.test('list handler executes checklist service', async t => {
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: '1234'
    }
  }

  const result = await deleteHandler.main(event)

  t.equal(deleteParams.listId, event.pathParameters.id)
  t.equal(deleteParams.userId, userId)
  t.equal(result.statusCode, 200)
})
