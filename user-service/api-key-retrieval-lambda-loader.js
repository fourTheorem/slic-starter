'use strict'
const fs = require('fs')

// Load the Lambda as a string
module.exports = () => {
  return fs.readFileSync('./api-key-retrieval-lambda.js', 'utf8')
}
