const t = require('tap')
const { v4: uuid } = require('uuid')

const { userId, userRequestContext, commonEventProps } = require('../../fixtures')
const invitationUtil = require('../../../lib/invitation')

const codeSecret = uuid()
const { createCode } = invitationUtil(codeSecret)
const params = {
  listName: 'A Test List',
  listId: uuid(),
  userId,
  email: 'email@example.com'
}

let confirmArgs = []
const confirmHandler = t.mock('../../../services/sharing/confirm', {
  '../../../services/sharing/share': {
    confirm: (...args) => {
      confirmArgs.push(...args)
      return Promise.resolve()
    }
  }
})

t.beforeEach(async () => {
  confirmArgs = []
})

t.test('An invitation can be confirmed', async t => {
  const code = createCode(params)
  const pathParameters = {
    code
  }
  const event = {
    ...commonEventProps,
    requestContext: userRequestContext,
    pathParameters
  }
  const ctx = { codeSecret }

  const res = await confirmHandler.main(event, ctx)

  t.same(confirmArgs, [{ code, userId }, codeSecret])
  t.match(res, { statusCode: 204 })
})
