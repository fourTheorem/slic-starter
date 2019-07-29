'use strict'

const middy = require('middy')
const {
  cors,
  jsonBodyParser,
  httpEventNormalizer,
  httpErrorHandler,
  ssm
} = require('middy/middlewares')
const { autoProxyResponse } = require('middy-autoproxyresponse')
const loggerMiddleware = require('lambda-logger-middleware')
const log = require('./log')

function middify(exports, options = {}) {
  const result = {}
  Object.keys(exports).forEach(key => {
    const handler = middy(exports[key])
      .use(
        loggerMiddleware({
          logger: log
        })
      )
      .use(httpEventNormalizer())
      .use(jsonBodyParser())
      .use(cors())
      .use(autoProxyResponse())
      .use(httpErrorHandler())

    if (options.ssmParameters) {
      handler.use(
        ssm({
          cache: true,
          names: options.ssmParameters
        })
      )
    }
    result[key] = handler
  })
  return result
}

module.exports = {
  middify
}
