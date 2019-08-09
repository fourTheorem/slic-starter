'use strict'

const awscred = require('awscred')
const { CloudFormation } = require('aws-sdk')

const stage = process.env.SLIC_STAGE || 'local'
const domainSuffix = stage === 'prod' ? '' : `${stage}.`
const stackName = `user-service-${stage}`

let backendConfig

const propertyMappings = {
  'identity-pool': 'identityPool',
  'user-pool-client-id': 'userPoolClientId',
  'user-pool-id': 'userPoolId'
}

async function loadBackendConfig() {
  if (!backendConfig) {
    if (stage === 'local') {
      return {
        apiEndpoint: 'http://localhost:4000',
        identityPool: 'test-identity-pool',
        userPoolClientId: 'test-user-pool-client-id',
        userPoolId: 'test-user-pool-id'
      }
    }

    const nsDomain = process.env.SLIC_NS_DOMAIN
    if (!nsDomain) {
      throw new Error('SLIC_NS_DOMAIN must be set')
    }
    const apiEndpoint = `https://api.${domainSuffix}${nsDomain}`

    const awsRegion = awscred.loadRegionSync()

    if (!awsRegion) {
      throw new Error(
        'The region must be set using any of the AWS-SDK-supported methods to the region of the deployed backend'
      )
    }

    const cf = new CloudFormation()

    backendConfig = await cf
      .describeStacks({ StackName: stackName })
      .promise()
      .then(data => {
        if (data.Stacks && data.Stacks[0]) {
          const exportBackendPairs = data.Stacks[0].Outputs.filter(
            output => !!output.ExportName
          ).map(({ OutputValue: value, ExportName: exportName }) => {
            const property = exportName
              .split('-')
              .slice(1)
              .join('-')
            return {
              [propertyMappings[property]]: value
            }
          })
          const backendConfig = {
            apiEndpoint
          }
          exportBackendPairs.forEach(pair => Object.assign(backendConfig, pair))
          return backendConfig
        }
      })
  }
  return backendConfig
}

module.exports = {
  loadBackendConfig
}
