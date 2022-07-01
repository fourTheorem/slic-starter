const { GetParameterCommand, SSMClient } = require('@aws-sdk/client-ssm');

const realConfig = require('test-common/real-email-config');
const localConfig = require('./local-email-config');

const ssmClient = new SSMClient({});
const stage = process.env.SLIC_STAGE;

const frontendUrlPromise =
  stage === 'local'
    ? Promise.resolve('http://localhost:3000')
    : ssmClient
        .send(new GetParameterCommand({ Name: `/${stage}/frontend/url` }))
        .then((data) => data.Parameter.Value);

export function getBaseUrl() {
  return frontendUrlPromise;
}

export function getEmail() {
  let config;
  if (stage === 'local') {
    config = localConfig;
  } else {
    config = realConfig;
  }

  const email = config.generateEmailAddress();
  return email;
}

export function getCode(email) {
  switch (stage) {
    case 'local':
      return localConfig.retrieveCode(email);

    default:
      return realConfig.retrieveCode(email).then((result) => result);
  }
}
