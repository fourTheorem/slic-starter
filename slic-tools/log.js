'use strict'

const pino = require('pino')

const { name } = require('./service-info')

module.exports = pino({
  name,
  level: process.env.DEBUG ? 'debug' : 'info'
})
