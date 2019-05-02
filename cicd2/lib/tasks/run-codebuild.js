'use strict'

const AWS = require('aws-sdk')
const codeBuild = new AWS.CodeBuild()

const handler = (event, context, callback) => {
  console.log('run-codebuild handler', event, context)

  const { codeBuildProjectArn } = event

  const projectName = codeBuildProjectArn.split('/').pop()

  codeBuild.startBuild(
    {
      projectName
    },
    (err, data) => {
      if (err) {
        console.error(err, 'Error')
      } else {
        console.log('Build started successfully', data)
      }
      callback(null, data)
    }
  )
}

module.exports = {
  handler
}
