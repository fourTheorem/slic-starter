module.exports = serverless => {
  const { stage } = serverless.providers.aws.options
  const region = 'us-east-1'
  const stackName = `certs-${stage}`
  const exports = {
    [`${stage}-site-cert`]: 'siteCert',
    [`${stage}-public-hosted-zone`]: 'publicHostedZone'
  }

  const provider = serverless.getProvider('aws')
  const { credentials } = provider.getCredentials()

  const cf = new provider.sdk.CloudFormation({ credentials, region })

  const values = {}
  return cf
    .describeStacks({ StackName: stackName })
    .promise()
    .then(data => {
      if (data.Stacks && data.Stacks[0]) {
        data.Stacks[0].Outputs.filter(
          output => exports[output.ExportName]
        ).forEach(({ ExportName: exportName, OutputValue: value }) => {
          values[exports[exportName]] = value
        })

        console.log('Using site config', values)
        return values
      } else {
        throw new Error(`No stack found with name ${stackName}`)
      }
    })
}
