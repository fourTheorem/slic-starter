'use strict'

const middy = require('@middy/core')
const httpCors = require('@middy/http-cors')
const httpEventNormalizer = require('@middy/http-event-normalizer')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const ssm = require('@middy/ssm')
const inputOutputLogger = require('@middy/input-output-logger')

const log = require('./log')

function middify (exports, options = {}) {
  const result = {}
  Object.keys(exports).forEach(key => {
    const handler = middy(exports[key])
      .use(inputOutputLogger({
        logger: (request) => {
          log.debug({ request }, 'request')
        }
      }))
      .before(async (request) => {
        const { event } = request
        const isHttpEvent = event.httpMethod !== undefined || event.requestContext?.http?.method !== undefined
        if (isHttpEvent) {
          const { before } = httpEventNormalizer()
          before(request)
        }
      }).use([
        httpJsonBodyParser(),
        httpCors(),
        httpErrorHandler()
      ])

    /* istanbul ignore next */
    if (options.ssmParameters && process.env.SLIC_STAGE !== 'test') {
      handler.use(
        ssm({
          fetchData: options.ssmParameters,
          awsClientOptions: {
            endpoint: process.env.SSM_ENDPOINT_URL
          },
          setToContext: true
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
