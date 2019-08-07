'use strict'

const pino = require('pino')

const { name } = require('./service-info')

module.exports = pino({
  name,
  level:
    process.env.DEBUG ||
    process.env.IS_OFFLINE ||
    process.env.SLIC_STAGE === 'dev'
      ? 'debug'
      : 'info'
})
