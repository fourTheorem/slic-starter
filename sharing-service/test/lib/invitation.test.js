'use strict'
const uuid = require('uuid')
const { test } = require('tap')

const userId = uuid.v4()
const listId = uuid.v4()
const email = 'example@example.com'

test('A code can be created and parsed', t => {
  const secret = 'passw0rd'
  const { createCode, parseCode } = require('../../lib/invitation')(secret)

  const code = createCode({ userId, listId, email })
  t.equal(typeof code, 'string')
  const parsedCode = parseCode(code)

  t.same(parsedCode, { userId, listId, email })
  t.end()
})

test('A code is different for a different email address', t => {
  const secret = 'passw0rd'
  const { createCode, parseCode } = require('../../lib/invitation')(secret)

  const userId = uuid.v4()
  const listId = uuid.v4()
  const email = 'example@example.com'

  const code = createCode({ userId, listId, email })

  const newEmail = 'different-user@example.com'
  const differentCode = createCode({ userId, listId, email: newEmail })
  t.notEqual(code, differentCode)

  t.end()
})

test('A code does not match with a different secret', t => {
  const invitation1 = require('../../lib/invitation')('passw0rd')

  const code = invitation1.createCode({ userId, listId, email })
  t.equal(typeof code, 'string')
  invitation1.parseCode(code)

  const invitation2 = require('../../lib/invitation')('n3ws3cr3t')
  t.throws(() => invitation2.parseCode(code))
  t.end()
})

test('A code will not be created if missing required data', t => {
  const secret = 'secret'
  const { createCode } = require('../../lib/invitation')(secret)
  t.throws(() => createCode({ userId, email }))
  t.end()
})
