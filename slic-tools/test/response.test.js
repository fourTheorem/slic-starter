'use strict'

const { test } = require('tap')

const { createResponse } = require('../response')

test('create response returns an error code when a promise reject', async t => {
  const failedPromise = new Promise((resolve, reject) => {
    reject(new Error('Promise Rejected'))
  })

  const result = await createResponse(failedPromise)

  t.equal(result.statusCode, 500)
  const parsedBody = JSON.parse(result.body)
  t.match(parsedBody, { ok: false })
  t.ok(result.headers)

  t.end()
})

const testInputs = [
  {
    options: {},
    response: { name: 'yes' },
    expectedCode: 200,
    expectedBody: { name: 'yes' }
  },
  {
    options: { successCode: 201 },
    expectedCode: 201,
    expectedBody: {}
  },
  {
    response: { name: 'yes' },
    expectedCode: 200,
    expectedBody: { name: 'yes' }
  }
]

testInputs.forEach(({ options, response, expectedCode, expectedBody }) => {
  test(`create response returns a success code when a promise resolves with ${JSON.stringify(
    response
  )} and options is ${JSON.stringify(options)}`, async t => {
    const successPromise = new Promise((resolve, reject) => {
      resolve(response)
    })

    const result = await createResponse(successPromise, options)

    t.equal(result.statusCode, expectedCode)
    const parsedBody = JSON.parse(result.body)
    t.match(parsedBody, expectedBody)
    t.ok(result.headers)

    t.end()
  })
})
