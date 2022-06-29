const t = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

let createParams = {}
const payload = {
  name: 'hello',
  description: 'New Description'
}

const createHandler = t.mock('../../../services/checklists/create', {
  '../../../services/checklists/checklist.js': {
    create: params => {
      createParams = { ...params }
      return Promise.resolve(createParams)
    }
  }
})

t.beforeEach(async () => {
  createParams = {}
})

t.test('create handler creates new checklists', async t => {
  const event = {
    requestContext: userRequestContext,
    body: JSON.stringify(payload)
  }

  const result = await createHandler.main(event)

  t.equal(result.statusCode, 201)
  t.equal(createParams.userId, userId)
  t.equal(createParams.name, payload.name)
  t.equal(createParams.description, payload.description)
})
