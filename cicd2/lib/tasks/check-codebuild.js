'use strict'

const AWS = require('aws-sdk')
const codeBuild = new AWS.CodeBuild()

/**
 * @param {object} event The event
 * @param {object} event.build The `build` object from the `codeBuild.StartBuild` response
 * @param {*} context
 */
const handler = async (event, context) => {
  console.log('check-codebuild handler', event, context)

  const { build } = event
  const buildResult = await codeBuild
    .batchGetBuilds({
      ids: [build.id]
    })
    .promise()

  const { buildComplete, buildStatus, currentPhase } = buildResult.builds[0]

  return {
    buildComplete,
    buildStatus,
    currentPhase
  }
}

module.exports = {
  handler
}
