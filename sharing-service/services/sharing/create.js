'use strict'

const { processEvent } = require('slic-tools/event-util')
const { middify } = require('slic-tools/middy-util')
const share = require('./share')

async function main(event) {
  const { body, userId } = processEvent(event)
  const { email, listId, listName } = body

  const result = await share.create({ email, listId, listName, userId })
  return {
    statusCode: 201,
    body: result
  }
}

module.exports = middify(
  { main },
  {
    ssmParameters: {
      CODE_SECRET: `/${process.env.SLIC_STAGE}/sharing-service/code-secret`,
      USER_SERVICE_URL: `/${process.env.SLIC_STAGE}/user-service/url`,
      FRONTEND_URL: `/${process.env.SLIC_STAGE}/frontend/url`
    }
  }
)
