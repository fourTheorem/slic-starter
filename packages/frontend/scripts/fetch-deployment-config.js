const {
  CloudFormationClient,
  DescribeStacksCommand
} = require('@aws-sdk/client-cloudformation');
const fs = require('fs')
const path = require('path')
const awscred = require('awscred')
const yaml = require('js-yaml')

const appConfig = yaml.load(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'app.yml'), 'utf8'))

const { domainConfig: { nsDomain } } = appConfig

const stage = process.env.SLIC_STAGE

console.log(`Using domain ${nsDomain}`)

if (!stage) {
  console.warn(
    'No SLIC_STAGE is set. Skipping retrieval of deployment configuration from AWS'
  )
  process.exit(0)
}

const domainSuffix = stage === 'prod' ? '' : `${stage}.`
const userServiceStackName = `user-service-${stage}`
const apiStackPaths = {
  'checklist-service': '/checklist',
  'sharing-service': '/share'
}

const awsRegion = awscred.loadRegionSync()

if (!awsRegion) {
  throw new Error(
    'The region must be set using any of the AWS-SDK-supported methods to the region of the deployed backend'
  )
}

console.log('Using region', awsRegion)

const cf = new CloudFormationClient({ region: awsRegion })

const envFilename = '.env.production'
fs.writeFileSync(
  envFilename,
  `SKIP_PREFLIGHT_CHECK=true\nREACT_APP_AWS_REGION=${awsRegion}\n`
)

Promise.all([getUserServiceEnv(), getApiEndpointsEnv()])
  .then((envContentsList) => {
    console.log('Writing', envFilename)
    envContentsList.forEach((envContents) => {
      if (envContents) {
        fs.appendFileSync(envFilename, envContents + '\n')
      }
    })
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

function getUserServiceEnv () {
  console.log(userServiceStackName)
  return cf.send(new DescribeStacksCommand({ StackName: userServiceStackName }))
    .then((data) => {
      if (data.Stacks && data.Stacks[0]) {
        const stageEnvContents = data.Stacks[0].Outputs.filter(
          (output) => !!output.ExportName
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
        return stageEnvContents
      } else {
        throw new Error(`Unable to find stack ${userServiceStackName}`)
      }
    })
}

function getApiEndpointsEnv () {
  /* If nsDomain is not set use describe stacks and
     get API Endpoint URL's from cloudformation outputs */
  return Promise.all(
    Object.keys(apiStackPaths).map((stackNamePrefix) => {
      const stackNameEnv =
        stackNamePrefix.toUpperCase().replace(/-/g, '_') + '_URL'
      const apiUrlPromise = nsDomain
        ? Promise.resolve(
            `https://api.${domainSuffix}${nsDomain}${apiStackPaths[stackNamePrefix]}`
        )
        : cf.send(new DescribeStacksCommand({ StackName: `${stackNamePrefix}-${stage}` }))
          .then(
            (data) =>
              data.Stacks[0].Outputs.find(
                (output) => output.OutputKey === 'ServiceEndpoint'
              ).OutputValue
          )
      return apiUrlPromise.then((url) => `REACT_APP_${stackNameEnv}=${url}`)
    })
  ).then((results) => results.join('\n'))
}
