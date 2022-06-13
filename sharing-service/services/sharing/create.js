'use strict'

const { processEvent } = require('slic-tools/event-util')
const { middify } = require('slic-tools/middy-util')
const share = require('./share')

async function main (event, context) {
  const { body, userId } = processEvent(event)
  const { email, listId, listName } = body

  const result = await share.create(
    { email, listId, listName, userId },
    context.codeSecret, context.userServiceUrl, context.frontendUrl
  )
  return {
    statusCode: 201,
    body: result
  }
}

module.exports = middify(
  { main },
  {
    ssmParameters: {
      codeSecret: `/${process.env.SLIC_STAGE}/sharing-service/code-secret`,
      userServiceUrl: `/${process.env.SLIC_STAGE}/user-service/url`,
      frontendUrl: `/${process.env.SLIC_STAGE}/frontend/url`
    },
    isHttpHandler: true
  }
)
