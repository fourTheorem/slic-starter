const { CloudFormation, STS } = require('aws-sdk')
const fs = require('fs')

const cf = new CloudFormation()
const sts = new STS()
sts
  .getCallerIdentity({})
  .promise()
  .then(identity => {
    cf.describeStacks()
      .promise()
      .then(data => {
        const results = data.Stacks.map(stack => {
          const endpointOutput = stack.Outputs.find(
            output => output.OutputKey === 'ServiceEndpoint'
          )

          return endpointOutput && { endpointOutput, stack }
        }).filter(result => !!result)

        results.forEach(result => {
          const stackName = result.stack.StackName
          const apiUrl = result.endpointOutput.OutputValue

          const stackNameEnv =
            stackName.toUpperCase().replace(/-/g, '_') + '_URL'
          const env = `REACT_APP_${stackNameEnv}=${apiUrl}\n`
          console.log(env)
          const envFilename = `.env.production.test`
          console.log('Writing', envFilename)
          fs.appendFileSync(envFilename, env)
        })
      })
  })
