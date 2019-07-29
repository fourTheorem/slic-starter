'use strict'

const AWS = require('aws-sdk')
const awsXray = require('aws-xray-sdk')
const signedAxios = require('aws-signed-axios')
const SSM = awsXray.captureAWSClient(
  new AWS.SSM({ endpoint: process.env.SSM_ENDPOINT_URL })
)

const log = require('./log')
const userServiceUrlPromise = fetchUserServiceUrl()

async function getUser(userId) {
  const userUrl = `${await getUserServiceUrl()}${userId}`

  debugger

  const { data: result } = await signedAxios({
    method: 'GET',
    url: userUrl
  })
  return result
}

function getUserServiceUrl() {
  return userServiceUrlPromise
}

async function fetchUserServiceUrl() {
  const params = {
    Name: `/${process.env.SLIC_STAGE}/user-service/url`
  }

  const result = await SSM.getParameter(params).promise()
  console.log({ result }, 'User service URL retrieved')
  return result.Parameter.Value
}

module.exports = {
  getUser,
  getUserServiceUrl
}
