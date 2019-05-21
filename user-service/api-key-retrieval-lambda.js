'use strict'
// This function is a CloudFormation customer resource
// implementation. It fetches the value (and other properties)
// of any API Gateway API Key and returns all properties
// as the CloudFormation resource output.
// $
// See https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-cfnresponsemodule
//
const response = require('cfn-response')

const AWS = require('aws-sdk')
const apiGateway = new AWS.APIGateway()

async function handler(event, context) {
  console.log({ event, context }, 'Event')

  let responseStatus
  let responseData

  try {
    const apiKey = event.ResourceProperties.ApiKeyName
    const { items } = await apiGateway
      .getApiKeys({ nameQuery: apiKey, includeValues: true })
      .promise()
    if (items.length < 1) {
      responseStatus = response.FAILED
      responseData = {
        error: true,
        message: 'No API Key found with name ' + apiKey
      }
    } else {
      responseStatus = response.SUCCESS
      responseData = items[0]
    }
  } catch (err) {
    console.error({ err })
    responseStatus = response.FAILED
    responseData = err
  }
  response.send(event, context, responseStatus, responseData)
  console.log(
    { responseStatus, responseData },
    'Sent response to CloudFormation'
  )
  return {
    responseStatus,
    responseData
  }
}

module.exports = {
  handler
}
