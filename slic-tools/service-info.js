'use strict'

const path = require('path')

const { name, version } = require(path.join(process.cwd(), 'package.json'))

module.exports = {
  name,
  version
}
