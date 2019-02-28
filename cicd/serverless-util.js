'use strict'

const fs = require('fs')

function includeFile(file) {
  return file.endsWith('.js') ? require(file)() : fs.readFileSync(file)
}

module.exports = {
  includeFile
}
