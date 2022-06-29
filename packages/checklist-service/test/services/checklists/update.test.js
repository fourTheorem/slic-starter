const t = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

let updateParams = {}
const updateHandler = t.mock('../../../services/checklists/update', {
  '../../../services/checklists/checklist.js': {
    update: params => {
      updateParams = { ...params }
      return Promise.resolve(updateParams)
    }
  }
})

t.beforeEach(async () => {
  updateParams = {}
})

t.test('update handler updates current checklist', async t => {
  const payload = {
    name: 'checklist name',
    description: 'Checklist Description'
  }
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: '1234'
    },
    body: JSON.stringify(payload)
  }

  const result = await updateHandler.main(event)

  t.equal(result.statusCode, 200)
  t.equal(updateParams.userId, userId)
  t.equal(updateParams.name, payload.name)
  t.equal(updateParams.description, payload.description)
})
