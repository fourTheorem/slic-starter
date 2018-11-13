const envVars = {
  region: 'REACT_APP_AWS_REGION',
  userPoolId: 'REACT_APP_AWS_COGNITO_USER_POOL_ID',
  userPoolWebClientId: 'REACT_APP_AWS_COGNITO_WEB_CLIENT_ID',
  identityPoolId: 'REACT_APP_AWS_COGNITO_IDENTITY_POOL_ID',
  checklistEndpoint: 'REACT_APP_CHECKLIST_API_ENDPOINT'
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

const { checklistEndpoint, ...authConfig } = config

export default {
  Auth: {
    mandatorySignIn: true,
    ...authConfig
  },
  API: {
    endpoints: [
      {
        name: 'checklists',
        endpoint: checklistEndpoint,
        region: config.region
      }
    ]
  }
}
