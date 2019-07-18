'use strict'

const path = require('path')

const pino = require('pino')

const { name } = require(path.join(process.cwd(), 'package.json'))

module.exports = pino({
  name,
  level: process.env.DEBUG ? 'debug' : 'info'
})
