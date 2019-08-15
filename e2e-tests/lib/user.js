'use strict'
import nid from 'nid'

const config = require('../lib/config')

module.exports = {
  generateUser
}

function generateUser() {
  const user = {}
  user.email = config.getEmail() // Generate a unique address for each user
  user.password = `${nid(4).toUpperCase()}${nid(6)}${Math.floor(
    Math.random() * 100
  )}!$`
  return user
}
