module.exports = serverless => {
  const stage = process.env.SLIC_STAGE
  if (stage === 'local') {
    return {
      apiCert: '',
      publicHostedZone: ''
    }
  }

  const values = {}
  const region = 'us-east-1'
  const stackName = `certs-${stage}`
  const exports = {
    [`${stage}-api-cert`]: 'apiCert',
    [`${stage}-public-hosted-zone`]: 'publicHostedZone'
  }

  const provider = serverless.getProvider('aws')
  const { credentials } = provider.getCredentials()

  const cf = new provider.sdk.CloudFormation({ credentials, region })
  const sts = new provider.sdk.STS({ credentials, region })

  return sts
    .getCallerIdentity({})
    .promise()
    .then(identity => {
      console.log('Identity', identity)
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

            console.log('Using api config', values)
            return values
          } else {
            throw new Error(`No stack found with name ${stackName}`)
          }
        })
    })
    .catch(err => {
      const errMsg =
        'ERROR: Failed to fetch certificate for API gateway configuration - ' +
        err.message
      throw new Error(errMsg)
    })
}
