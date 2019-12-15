# SLIC Starter Integration Tests

This package contains API integration tests. These tests exercise the external endpoints of the system and test integration with real, external dependencies like DynamoDB. The tests can be run against a remote, deployed environment in AWS or a local development version of the system running in offline mode.

[![asciicast](https://asciinema.org/a/s1QZfAfZiwXa9ZS0F9JFhYuEt.svg)](https://asciinema.org/a/s1QZfAfZiwXa9ZS0F9JFhYuEt)

## Preparing Integration tests

Ensure you have created a Mailosaur account as documented in the [README](../README.md). This allows the integratin tests to receive signup and verification emails. Once you have done that, set the following environment variables in your shell. The values can be retrieved from your mailosaur account.

```
export MAILOSAUR_API_KEY=<api_key_value>
export MAILOSAUR_SERVER_ID=<server_id>
```

## Running Integration Tests

The value of the `SLIC_STAGE` environment indicates which endpoints the integration tests will run against.

To run against the _local offline_ system, simply execute:

```
SLIC_STAGE=local npm test
```

To run against the _remote_ system, simply execute the following, substituting `stg` with the value of the stage you wish to target and specfiying the root domain your deployment uses. If you have configured your deployment without a domain (according to the QUICK START guide), this environment variable is not required.

```
SLIC_NS_DOMAIN=sliclists.com SLIC_STAGE=stg npm test
```

In both cases, ensure that relevant AWS credentials are set in your environment (either through `AWS_PROFILE` with `AWS_SDK_LOAD_CONFIG=true` or with individual environment variables (`AWS_ACCESS_KEY_ID`, etc.).

## How this works

- The test framework used is [node-tap](http://node-tap.org/)
- The HTTP client used is [axios](https://github.com/axios/axios)
- When the value of `SLIC_STAGE` is not `local`, the backend configuration for the real deployment is determined by fetching the [export CloudFormation outputs](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-exports.html) for the backend deployment. These are defined in the backend's `serverless.yml`. These values include the AWS Cognito user pool and identity pool configs. The URL of the API Gateaway is determined by convention. See [here](lib/backend-config.js) for the code.
- When running tests against a real AWS deployment, Cognito users are created in tests using the admin functions of the [CognitoIdentityServiceProvider](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html) AWS SDK Service Interface. See [here](lib/cognito-util.js) for the code that does this.
- In local offline mode, Cognito user pool authentication is simulated the creation of a simulated user with a JWT token that can be used in the `Authorization` header of HTTP requests used with [serverless-offline](https://github.com/dherault/serverless-offline). See [here](lib/user-util.js) for the relevant code.

## Troubleshooting

The environment variable, `VERBOSE_AXIOS_ERRORS` can be set to get the full http errors with stack trace. Normally, the `tap` test reporters print _everything_ in the Error object tree, including some function sources. This can get difficult to read, so it's suppressed by default. See [here](lib/axios-util.js) for the code that does this.

Set to get full axios error traces in test output. By default, axios errors are trimmed to avoid verbose output that makes finding important details difficult.
