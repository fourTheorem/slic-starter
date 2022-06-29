const t = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

let getParams = {}
const getHandler = t.mock('../../../services/checklists/get', {
  '../../../services/checklists/checklist.js': {
    get: params => {
      getParams = { ...params }
      return Promise.resolve(getParams)
    }
  }
})

t.beforeEach(async () => {
  getParams = {}
})

t.test('get handler gets checklists', async t => {
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: '1234'
    }
  }

  const result = await getHandler.main(event)

  t.equal(result.statusCode, 200)
  t.equal(getParams.listId, event.pathParameters.id)
  t.equal(getParams.userId, userId)
})
