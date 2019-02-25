'use strict'

const suppressedProperties = ['nativeProtocols']

function toneAxiosError(error) {
  debugger
  if (!process.env.VERBOSE_AXIOS_ERRORS) {
    // Remove verbose properties from request options
    const requestOptions = { ...error.request._options }
    Object.keys(error.request._options).forEach(property => {
      if (suppressedProperties.indexOf(property) > -1) {
        delete requestOptions[property]
      }
    })

    const summarized = {
      request: {
        _options: requestOptions
      }
    }

    if (error.response) {
      // TODO Add relevant response details
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
