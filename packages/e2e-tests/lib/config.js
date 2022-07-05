import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

import {
  generateEmailAddress as realGenerateEmailAddress,
  retrieveCode as realRetrieveCode,
} from 'test-common/real-email-config.js';
import {
  generateEmailAddress as localGenerateEmailAddress,
  retrieveCode as localRetrieveCode,
} from './local-email-config.js';

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
  return stage === 'local'
    ? localGenerateEmailAddress()
    : realGenerateEmailAddress();
}

export async function getCode(email) {
  return stage === 'local'
    ? localRetrieveCode(email)
    : realRetrieveCode(email).then((result) => result);
}
