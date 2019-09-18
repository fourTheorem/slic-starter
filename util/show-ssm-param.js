#!/usr/bin/env node

const AWS = require('aws-sdk')

const ssm = new AWS.SSM()

ssm
  .describeParameters()
  .promise()
  .then(({ Parameters: params }) => fetchParams(filterParams(params)))
  .then(output => console.log(output.join('\n')))

function filterParams(params) {
  return params.filter(param => param.Type !== 'SecureString')
}

function fetchParams(params) {
  return Promise.all(
    params.map(param =>
      ssm
        .getParameter({ Name: param.Name })
        .promise()
        .then(paramResult => `${param.Name}: ${paramResult.Parameter.Value}`)
    )
  )
}
