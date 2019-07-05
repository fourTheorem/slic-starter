'use strict'

const awsXray = require('aws-xray-sdk')
const AWS = awsXray.captureAWS(require('aws-sdk'))
const defaultOptions = {
  convertEmptyValues: true // If this is not set, empty strings cause an error. This converts them automatically to NULL
}

/*
 * Adapted from https://github.com/99xt/serverless-dynamodb-client/blob/master/index.js
 */

const localDynamoPort = process.env.DYNAMODB_LOCAL_PORT || 8000

const options = process.env.IS_OFFLINE
  ? {
      region: 'localhost',
      endpoint: `http://localhost:${localDynamoPort}`,
      ...defaultOptions
    }
  : defaultOptions

function dynamoDocClient() {
  return new AWS.DynamoDB.DocumentClient(options)
}

module.exports = {
  dynamoDocClient
}
