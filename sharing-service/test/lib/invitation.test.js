'use strict'
const uuid = require('uuid')
const { test } = require('tap')

const invitation = require('../../lib/invitation')

const listName = 'The quick fox jumps over the lazy dog'
const userId = uuid.v4()
const listId = uuid.v4()
const email = 'example@example.com'

test('A code can be created and parsed', t => {
  const secret = 'passw0rd'
  const { createCode, parseCode } = require('../../lib/invitation')(secret)

  const code = createCode({ userId, listId, listName, email })
  t.equal(typeof code, 'string')
  const parsedCode = parseCode(code)

  t.same(parsedCode, { userId, listId, listName, email })
  t.end()
})

test('A code can be created and parsed without a secret', t => {
  const basicParseCode = invitation.parseCode
  const secret = 'passw0rd'
  const { createCode } = invitation(secret)
  const code = createCode({ userId, listId, listName, email })
  const parsedCode = basicParseCode(code)
  t.same(parsedCode, { userId, listId, listName, email })
  t.end()
})

test('A code is different for a different email address', t => {
  const secret = 'passw0rd'
  const { createCode } = require('../../lib/invitation')(secret)

  const userId = uuid.v4()
  const listId = uuid.v4()
  const email = 'example@example.com'

  const code = createCode({ userId, listId, listName, email })

  const newEmail = 'different-user@example.com'
  const differentCode = createCode({
    userId,
    listId,
    listName,
    email: newEmail
  })
  t.notEqual(code, differentCode)

  t.end()
})

test('A listname can be extracted from the code', t => {
  const secret = 'passw0rd'
  const { createCode } = require('../../lib/invitation')(secret)

  const userId = uuid.v4()
  const listId = uuid.v4()
  const email = 'example@example.com'

  const code = createCode({ userId, listId, listName, email })

  // Front end code for extracting list name starts here
  const normalized = code.replace(/-/g, '+').replace(/_/g, '/')
  const codeBuffer = Buffer.from(normalized, 'base64')
  const dataBuffer = codeBuffer.subarray(32)
  const nameLength = dataBuffer.readUInt8()
  const name = dataBuffer.subarray(1, nameLength + 1).toString()
  // ...ends here

  t.equal(name, listName)

  t.end()
})

test('A code does not match with a different secret', t => {
  const invitation1 = require('../../lib/invitation')('passw0rd')

  const code = invitation1.createCode({ userId, listId, listName, email })
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

test('An invalid code with throw an error', t => {
  const secret = 'secret'
  const { parseCode } = require('../../lib/invitation')(secret)
  t.throws(() => parseCode('abcdefg'))
  t.end()
})
