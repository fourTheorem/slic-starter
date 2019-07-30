'use strict'

const { processEvent } = require('slic-tools/event-util')
const { middify } = require('slic-tools/middy-util')
const share = require('./share')

function main(event) {
  const { body, userId } = processEvent(event)
  const { code } = body

  return share.confirm({ code, userId }).then(() => ({}))
}

module.exports = middify(
  { main },
  {
    ssmParameters: {
      CODE_SECRET: 'CODE_SECRET'
    }
  }
)
