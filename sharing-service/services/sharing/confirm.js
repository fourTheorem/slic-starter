'use strict'

const { processEvent } = require('slic-tools/event-util')
const { middify } = require('slic-tools/middy-util')
const share = require('./share')

function main(event) {
  const { pathParameters, userId } = processEvent(event)
  const { code } = pathParameters

  return share.confirm({ code, userId }).then(() => ({}))
}

module.exports = middify(
  { main },
  {
    ssmParameters: {
      CODE_SECRET: `/${process.env.SLIC_STAGE}/sharing-service/code-secret`
    }
  }
)
