const fs = require('fs')
const awscred = require('awscred')
const { CloudFormation } = require('aws-sdk')

const stage = process.env.SLIC_STAGE

if (!stage) {
  console.warn(
    'No SLIC_STAGE is set. Skipping retrieval of deployment configuration from AWS'
  )
  process.exit(0)
}

const domainSuffix = stage === 'prod' ? '' : `${stage}.`
const stackName = `slic-starter-backend-${stage}`
const awsRegion = awscred.loadRegionSync()

if (!awsRegion) {
  throw new Error(
    'The region must be set using any of the AWS-SDK-supported methods to the region of the deployed backend'
  )
}

const cf = new CloudFormation()

cf.describeStacks({ StackName: stackName })
  .promise()
  .then(data => {
    if (data.Stacks && data.Stacks[0]) {
      const stageEnvContents = data.Stacks[0].Outputs.filter(
        output => !!output.ExportName
      )
        .map(({ OutputValue: value, ExportName: exportName }) => {
          const envName = exportName
            .split('-')
            .slice(1)
            .join('_')
            .toUpperCase()
          return `REACT_APP_${envName}=${value}`
        })
        .join('\n')
      const envContents = `REACT_APP_API_ENDPOINT=https://api.${domainSuffix}sliclists.com
REACT_APP_AWS_REGION=${process.env.AWS_REGION}
${stageEnvContents}`

      const envFilename = `.env.production`
      console.log('Writing', envFilename)
      fs.writeFileSync(envFilename, envContents)
    } else {
      throw new Error(`Unable to find stack ${stackName}`)
    }
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
