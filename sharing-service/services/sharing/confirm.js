'use strict'

const { processEvent } = require('slic-tools/event-util')
const { middify } = require('slic-tools/middy-util')
const share = require('./share')

function main (event, context) {
  const { pathParameters, userId } = processEvent(event) // TODO - Remove processEvent
  const { code } = pathParameters

  return share.confirm({ code, userId }, context.codeSecret).then(() => ({}))
}

module.exports = middify(
  { main },
  {
    ssmParameters: {
      codeSecret: `/${process.env.SLIC_STAGE}/sharing-service/code-secret`
    },
    isHttpHandler: true
  }
)
