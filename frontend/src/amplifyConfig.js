import get from 'lodash/get'
import { simulatedAuth } from './mode'
import { Auth } from './auth-provider'

const envVars = {
  region: 'REACT_APP_AWS_REGION',
  userPoolId: 'REACT_APP_USER_POOL_ID',
  userPoolWebClientId: 'REACT_APP_USER_POOL_CLIENT_ID',
  identityPoolId: 'REACT_APP_IDENTITY_POOL',
  checklistServiceApiEndpoint: 'REACT_APP_CHECKLIST_SERVICE_URL',
  sharingServiceApiEndpoint: 'REACT_APP_SHARING_SERVICE_URL',
}

const config = {}
Object.entries(envVars).forEach(([key, env]) => {
  const value = process.env[env]
  if (!value || value.length === 0) {
    console.error(
      `${envVars[key]} must be defined at UI build time for AWS Amplify to be configured correctly`
    )
  }
  config[key] = value
})

const {
  checklistServiceApiEndpoint,
  sharingServiceApiEndpoint,
  ...authConfig
} = config

const commonEndpointConfig = {
  region: config.region,
  custom_header: async () => {
    const session = await Auth.currentSession()
    return {
      Authorization: get(session, 'idToken.jwtToken'),
    }
  },
}
const amplifyConfig = {
  API: {
    endpoints: [
      {
        name: 'checklist-api',
        endpoint: checklistServiceApiEndpoint,
        ...commonEndpointConfig,
      },
      {
        name: 'sharing-api',
        endpoint: sharingServiceApiEndpoint,
        ...commonEndpointConfig,
      },
    ],
  },
}

if (!simulatedAuth) {
  amplifyConfig.Auth = {
    mandatorySignIn: true,
    ...authConfig,
  }
}

export default amplifyConfig
