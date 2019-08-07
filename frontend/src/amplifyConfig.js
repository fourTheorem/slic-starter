import get from 'lodash/get'
import { simulatedAuth } from './mode'
import { Auth } from './auth-provider'

const envVars = {
  region: 'REACT_APP_AWS_REGION',
  userPoolId: 'REACT_APP_USER_POOL_ID',
  userPoolWebClientId: 'REACT_APP_USER_POOL_CLIENT_ID',
  identityPoolId: 'REACT_APP_IDENTITY_POOL',
  apiEndpoint: 'REACT_APP_API_ENDPOINT'
}

const config = {}
Object.entries(envVars).forEach(([key, env]) => {
  const value = process.env[env]
  if (!value || value.length === 0) {
    console.error(
      `${
        envVars[key]
      } must be defined at UI build time for AWS Amplify to be configured correctly`
    )
  }
  config[key] = value
})

const { apiEndpoint, ...authConfig } = config

const amplifyConfig = {
  API: {
    endpoints: [
      {
        name: 'slic-lists-api',
        endpoint: apiEndpoint,
        region: config.region,
        custom_header: async () => {
          const session = await Auth.currentSession()
          return {
            Authorization: get(session, 'idToken.jwtToken')
          }
        }
      }
    ]
  }
}

if (!simulatedAuth) {
  amplifyConfig.Auth = {
    mandatorySignIn: true,
    ...authConfig
  }
}

export default amplifyConfig
