#!/usr/bin/env node

const AWS = require('aws-sdk')

const ssm = new AWS.SSM()

ssm
  .describeParameters()
  .promise()
  .then(({ Parameters: params }) => fetchParams(params))
  .then(output => console.log(output.join('\n')))

function fetchParams(params) {
  return Promise.all(
    params.map(param => {
      if (param.Type === 'SecureString') {
        return `${param.Name}: ****SECRET****`
      }
      return ssm
        .getParameter({ Name: param.Name })
        .promise()
        .then(paramResult => `${param.Name}: ${paramResult.Parameter.Value}`)
    })
  )
}
