'use strict'

const pick = require('lodash/pick')

const suppressedProperties = ['nativeProtocols']

function toneAxiosError(error) {
  if (!process.env.VERBOSE_AXIOS_ERRORS) {
    const summarized = {}

    // Remove verbose properties from request options
    if (error.request) {
      summarized.request = pick(error.request, [
        'headers',
        'method',
        'path',
        '_header'
      ])
      if (error.request._options) {
        const requestOptions = { ...error.request._options }
        Object.keys(error.request._options).forEach(property => {
          if (suppressedProperties.indexOf(property) > -1) {
            delete requestOptions[property]
          }
        })
        summarized.request = {
          _options: requestOptions
        }
      }
    }

    if (error.response) {
      summarized.response = pick(error.response, [
        'headers',
        'status',
        'statusText',
        'config.url',
        'data'
      ])
    }

    error._full_request = error.request
    error._full_response = error.response
    Object.assign(error, summarized)

    // Make large objects non-enumerable to remove excessive verbosity from logs
    ;['config', '_full_request', '_full_response'].forEach(property =>
      Object.defineProperty(error, property, { enumerable: false })
    )
  }
  return error
}

module.exports = {
  toneAxiosError
}
