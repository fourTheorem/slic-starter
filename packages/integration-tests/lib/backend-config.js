import {
  CloudFormationClient,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import awscred from 'awscred';

const stage = process.env.SLIC_STAGE || 'local';
const domainSuffix = stage === 'prod' ? '' : `${stage}.`;
const stackName = `user-service-${stage}`;

const apiStackPaths = {
  'checklist-service': '/checklist',
  'sharing-service': '/share',
};

const nsDomain = process.env.SLIC_NS_DOMAIN;

const awsRegion = awscred.loadRegionSync();
if (!awsRegion) {
  throw new Error(
    'The region must be set using any of the AWS-SDK-supported methods to the region of the deployed backend'
  );
}
const cf = new CloudFormationClient({ region: awsRegion });

let backendConfig;

const propertyMappings = {
  'identity-pool': 'identityPool',
  'user-pool-client-id': 'userPoolClientId',
  'user-pool-id': 'userPoolId',
};

function getApiEndpoints() {
  /* If nsDomain is not set use describe stacks and
     get API Endpoint URLs from cloudformation outputs */
  return Promise.all(
    Object.keys(apiStackPaths).map((apiName) => {
      const apiUrlPromise = nsDomain
        ? Promise.resolve(
            `https://api.${domainSuffix}${nsDomain}${apiStackPaths[apiName]}`
          )
        : cf
            .send(
              new DescribeStacksCommand({ StackName: `${apiName}-${stage}` })
            )
            .then(
              (data) =>
                data.Stacks[0].Outputs.find(
                  (output) => output.OutputKey === 'ServiceEndpoint'
                ).OutputValue
            );
      return apiUrlPromise.then((url) => ({ [apiName]: url }));
    })
  ).then((results) => Object.assign({}, ...results));
}

export async function loadBackendConfig() {
  if (!backendConfig) {
    if (stage === 'local') {
      return {
        apiEndpoints: {
          'checklist-service': 'http://localhost:4000/checklist',
          'sharing-service': 'http://localhost:4000/share',
        },
        identityPool: 'test-identity-pool',
        userPoolClientId: 'test-user-pool-client-id',
        userPoolId: 'test-user-pool-id',
      };
    }

    const apiEndpoints = await getApiEndpoints();

    backendConfig = await cf
      .send(new DescribeStacksCommand({ StackName: stackName }))
      .then((data) => {
        if (data.Stacks && data.Stacks[0]) {
          const exportBackendPairs = data.Stacks[0].Outputs.filter(
            (output) => !!output.ExportName
          ).map(({ OutputValue: value, ExportName: exportName }) => {
            const property = exportName.split('-').slice(1).join('-');
            return {
              [propertyMappings[property]]: value,
            };
          });
          const beConfig = {
            apiEndpoints,
          };
          for (const pair of exportBackendPairs) Object.assign(beConfig, pair);
          return beConfig;
        }
        throw new Error('Backend config not found');
      });
  }
  return backendConfig;
}
