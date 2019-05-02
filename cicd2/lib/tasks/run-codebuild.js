'use strict'

const AWS = require('aws-sdk')
const codeBuild = new AWS.CodeBuild()

const handler = async (event, context) => {
  console.log('run-codebuild handler', event, context)

  const { codeBuildProjectArn } = event

  const projectName = codeBuildProjectArn.split('/').pop()

  return await codeBuild
    .startBuild({
      projectName
    })
    .promise()
}

module.exports = {
  handler
}
