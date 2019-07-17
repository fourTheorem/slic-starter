const AWS = require('aws-sdk')
const SSM = new AWS.SSM()
const log = require('slic-tools/log')
async function getSSMValue() {
  const params = {
    Name: 'CODE_SECRET',
    WithDecryption: true
  }

  const data = SSM.getParameter(params)
    .promise()
    .then(result => result.Parameter.Value)

  return data
}
module.exports = {
  getSSMValue
}
