const AWS = require('aws-sdk')
const awsXray = require('aws-xray-sdk')

const SSM = awsXray.captureAWSClient(
  new AWS.SSM({ endpoint: process.env.SSM_ENDPOINT_URL })
)

async function getUserServiceUrl() {
  const result = await SSM.getParameter({ Name: 'UserServiceUrl' }).promise()
  const {
    Parameter: { Value: userServiceUrl }
  } = result
  return userServiceUrl
}

module.exports = {
  getUserServiceUrl
}
