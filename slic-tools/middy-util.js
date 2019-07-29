'use strict'

const middy = require('middy')
const { ssm } = require('middy/middlewares')
const loggerMiddleware = require('lambda-logger-middleware')
const log = require('./log')

function middify(exports, options = {}) {
  const result = {}
  Object.keys(exports).forEach(key => {
    const handler = middy(exports[key]).use(
      loggerMiddleware({
        logger: log
      })
    )
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
