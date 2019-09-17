'use strict'

const awscred = require('awscred')
const { CloudFormation } = require('aws-sdk')

const stage = process.env.SLIC_STAGE || 'local'
const domainSuffix = stage === 'prod' ? '' : `${stage}.`
const stackName = `user-service-${stage}`

const apiStackPaths = {
  'checklist-service': '/checklist',
  'sharing-service': '/share'
}

const nsDomain = process.env.SLIC_NS_DOMAIN
const cf = new CloudFormation()

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
        apiEndpoints: {
          'checklist-service': 'http://localhost:4000/checklist',
          'sharing-service': 'http://localhost:4000/share'
        },
        identityPool: 'test-identity-pool',
        userPoolClientId: 'test-user-pool-client-id',
        userPoolId: 'test-user-pool-id'
      }
    }

    const awsRegion = awscred.loadRegionSync()
    if (!awsRegion) {
      throw new Error(
        'The region must be set using any of the AWS-SDK-supported methods to the region of the deployed backend'
      )
    }

    const apiEndpoints = await getApiEndpoints()

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
            apiEndpoints
          }
          exportBackendPairs.forEach(pair => Object.assign(backendConfig, pair))
          return backendConfig
        }
      })
  }
  return backendConfig
}

function getApiEndpoints() {
  /* If process.env.SLIC_NS_DOMAIN is not set use describe stacks and
     get API Endpoint URLs from cloudformation outputs */
  return Promise.all(
    Object.keys(apiStackPaths).map(apiName => {
      const apiUrlPromise = nsDomain
        ? Promise.resolve(
            `https://api.${domainSuffix}${nsDomain}${apiStackPaths[apiName]}`
          )
        : cf
            .describeStacks({ StackName: `${apiName}-${stage}` })
            .promise()
            .then(
              data =>
                data.Stacks[0].Outputs.find(
                  output => output.OutputKey === 'ServiceEndpoint'
                ).OutputValue
            )
      return apiUrlPromise.then(url => ({ [apiName]: url }))
    })
  ).then(results => Object.assign({}, ...results))
}

module.exports = {
  loadBackendConfig
}
