'use strict'

const path = require('path')

const {
  SERVICE_NAME: name = 'default-service',
  SERVICE_VERSION: version = '0.0.0'
} = process.env

module.exports = {
  name,
  version
}
