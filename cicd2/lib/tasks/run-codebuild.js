'use strict'

const AWS = require('aws-sdk')
const codeBuild = new AWS.CodeBuild()

/**
 * @param {object} event
 * @param {string} event.codeBuildProjectArn
 * @param {*} context
 */
const handler = async (event, context) => {
  console.log('run-codebuild handler', event, context)

  const { sourceLocation, codeBuildProjectArn } = event

  const projectName = codeBuildProjectArn.split('/').pop()

  return await codeBuild
    .startBuild({
      projectName,
      sourceLocationOverride: sourceLocation
    })
    .promise()
}

module.exports = {
  handler
}
