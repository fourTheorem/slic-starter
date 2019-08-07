'use strict'

/**
 * Modified based on https://www.npmjs.com/package/middy-autoproxyresponse
 * MIT License.
 * Copyright (C) Clouden 2018
 * Author Kenneth Falck kennu@clouden.net 2018
 *
 * MODIFICATIONS:
 * - The onError handler has been removed as it swallows errors
 */
exports.autoProxyResponse = function() {
  return {
    after: function(handler, next) {
      if (!handler.response) {
        // Default response is empty object
        handler.response = {}
      }
      if (!handler.response.statusCode) {
        // Convert basic object to LAMBDA_PROXY response
        const body = JSON.stringify(handler.response)
        handler.response = {}
        handler.response.statusCode = 200
        handler.response.headers = {
          'Content-Type': 'application/json'
        }
        handler.response.body = body
      }
      next()
    }
  }
}
