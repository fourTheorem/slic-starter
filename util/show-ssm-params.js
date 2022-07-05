import {
  SSMClient,
  DescribeParametersCommand,
  GetParameterCommand,
} from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({ endpoint: process.env.SSM_ENDPOINT_URL });

async function fetchParams(params) {
  return Promise.all(
    params.map(async (param) => {
      if (param.Type === 'SecureString') {
        return `${param.Name}: ****SECRET****`;
      }
      const {
        Parameter: { Value },
      } = await ssmClient.send(new GetParameterCommand({ Name: param.Name }));

      return `${param.Name}: ${Value}`;
    })
  );
}

const { Parameters } = await ssmClient.send(new DescribeParametersCommand({}));

const fetchedParams = await fetchParams(Parameters);

console.log(fetchedParams.join('\n'));
