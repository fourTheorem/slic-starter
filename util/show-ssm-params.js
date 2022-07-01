const {
  SSMClient,
  DescribeParametersCommand,
  GetParameterCommand,
} = require('@aws-sdk/client-ssm');

const ssmClient = new SSMClient({ endpoint: process.env.SSM_ENDPOINT_URL });

function fetchParams(params) {
  return Promise.all(
    params.map((param) => {
      if (param.Type === 'SecureString') {
        return `${param.Name}: ****SECRET****`;
      }
      return ssmClient
        .send(new GetParameterCommand({ Name: param.Name }))
        .then((paramResult) => `${param.Name}: ${paramResult.Parameter.Value}`);
    })
  );
}

ssmClient
  .send(new DescribeParametersCommand({}))
  .then(({ Parameters: params }) => fetchParams(params))
  .then((output) => console.log(output.join('\n')))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
