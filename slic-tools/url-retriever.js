const AWS = require('aws-sdk')
const awsXray = require('aws-xray-sdk')
const SSM = awsXray.captureAWSClient(
  new AWS.SSM({ endpoint: process.env.SSM_ENDPOINT_URL })
)

async function getUserServiceUrl() {
  const params = {
    Name: 'UserServiceUrl'
  }

  const result = await SSM.getParameter(params).promise()
  console.log({ result })
  return result.Parameter.Value
}

getUserServiceUrl()

module.exports = {
  getUserServiceUrl
}
