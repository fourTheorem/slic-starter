'use strict'
const log = require('slic-tools/log')
const { createResponse } = require('slic-tools/response')
const share = require('./share')
const { processEvent } = require('slic-tools/event-util')

const middy = require('middy')
const { ssm } = require('middy/middlewares')
const loggerMiddleware = require('lambda-logger-middleware')

async function main(event) {
  const { body, userId } = processEvent(event)
  const { email, listId, listName } = body

  return createResponse(share.create({ email, listId, listName, userId }), {
    successCode: 201
  })
}

function middyExport(exports) {
  Object.keys(exports).forEach(key => {
    module.exports[key] = middy(exports[key])
      .use(
        loggerMiddleware({
          logger: log
        })
      )
      .use(
        ssm({
          cache: true,
          names: {
            USER_SERVICE_URL: 'UserServiceUrl',
            CODE_SECRET: 'CODE_SECRET'
          }
        })
      )
  })
}

middyExport({ main })
