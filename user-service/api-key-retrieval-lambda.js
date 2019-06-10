'use strict'

// This function is a CloudFormation customer resource
// implementation. It fetches the value (and other properties)
// of any API Gateway API Key and returns all properties
// as the CloudFormation resource output.
// $
// See https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-cfnresponsemodule
const response = require('cfn-response')
const AWS = require('aws-sdk')
const apiGateway = new AWS.APIGateway()

function handler(event, context) {
  console.log({ event, context }, 'Event')

  if (event.RequestType === 'Delete') {
    // No action required for deletions
    return response.send(event, context, response.SUCCESS, {})
  }

  let responseStatus
  let responseData

  const apiKey = event.ResourceProperties.ApiKeyName
  apiGateway.getApiKeys({ nameQuery: apiKey, includeValues: true }, function(
    err,
    result
  ) {
    if (err) {
      console.error({ err })
      responseStatus = response.FAILED
      responseData = err
    } else {
      const { items } = result
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
    }
    response.send(event, context, responseStatus, responseData)
    console.log(
      { responseStatus, responseData },
      'Sent response to CloudFormation'
    )
  })
}

module.exports = {
  handler
}
