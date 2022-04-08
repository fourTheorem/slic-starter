# SLIC Starter end-to-end (E2E) tests

This package contains end-to-end tests that use TestCafe to exercise functionality in the front end. The tests can be run against a remote, deployed environment in AWS or a local development version of the system running in offline mode.

## Preparing E2E tests

Ensure you have created a Mailosaur account as documented in the [README](../README.md) if you are using a real deployed backend. This allows the E2E tests to receive signup and verification emails. Once you have done that, set the following environment variables in your shell. The values can be retrieved from your mailosaur account.

```
export MAILOSAUR_API_KEY=<api_key_value>
export MAILOSAUR_SERVER_ID=<server_id>
```

## Running E2E Tests

The value of the `SLIC_STAGE` environment indicates which endpoints the integration tests will run against.

To run against the _local offline_ system, simply execute:

```
SLIC_STAGE=local npm test
```

To run against the _remote_ system, simply execute the following, change the value of SLIC_STAGE to the stage you wish to target. If you have configured your deployment without a domain (according to the QUICK START guide), this environment variable is not required.

```
SLIC_NS_DOMAIN=sliclists.com SLIC_STAGE=stg npm test
```

In both cases, ensure that relevant AWS credentials are set in your environment (either through `AWS_PROFILE` with `AWS_SDK_LOAD_CONFIG=true` or with individual environment variables (`AWS_ACCESS_KEY_ID`, etc.).

## Running individual tests

You can run a single test by specifying the tests explicitly as follows.

```
SLIC_STAGE=dev npm run testcafe -- test/login.test.js
```