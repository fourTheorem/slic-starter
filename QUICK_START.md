# SLIC Starter Quick Start!

This guide gets you up and running with a running SLIC Starter environment as quickly as possible.

This setup is faster than the full, domain-based, multi-account setup because:

1. No domains and certificates are provisioned. These steps require approval and DNS propagation time
2. Everything is deployed to a single AWS account - CI/CD, staging and production.

# Prerequisites

- Node v8 should be installed locally. A later version should also be perfectly acceptable. NPM v6 or later is recommended because it supports relative path modules better. (Like `test-common`, included as a relative dependency by `e2e-tests` and `integration-tests`)
- The Serverless Framework v1.51 or later should be installed:

```
npm install serverless@1.51 -g
```

# Steps

## 1. Fork and clone the repository

You should work within your own clone/fork of the repository so you can freely commit and push changes.

1. Fork the repository on GitHub
2. Clone the forked repository

## 2. Install packages

You should run `npm install` for all packages. Run the `./util/install-packages.sh` script to do this. The minimum requirement here is to run `npm install` in the `cicd` folder. Everything else is only really required for local development later.

## 3. Set up CodeBuild GitHub access

Set up CodeBuild GitHub access. There are a couple of ways to do this. The most reliable in our experience is with the AWS CLI. All methods are covered in the guide from AWS, available [here](https://docs.aws.amazon.com/codebuild/latest/userguide/sample-access-tokens.html).

1. Generate a skeleton for the CodeBuild CLI:

```
aws codebuild import-source-credentials --generate-cli-skeleton > /tmp/skeleton.json
```

2. Create a GitHub personal access token. Go to GitHub -> Settings -> Developer Settings -> Personal access tokens -> Generate new token -> Select 'repo'.
3. Paste the token into `token` in `/tmp/skeleton.json`
4. Change `serverType` to `GITHUB`
5. Change `authType` to `PERSONAL_ACCESS_TOKEN`
6. Delete `username`
7. Run `aws codebuild import-source-credentials --cli-input-json file:///tmp/skeleton.json`

## 4. Configure your target AWS account

1. Copy `slic-config.json.sample` to `slic-config.json`.
2. Edit it to specify the target AWS account ID for all accounts.
3. Remove `nsDomain`
4. Specify a new value for `siteBucketPrefix`.
5. Change repository owner and name.

## 5. Configure secrets and parameters

If you wish, this step can be defered until you have problems with deployment and tests failing due to missing configuration.

1. Create an account on mailosaur.com and grab the API key and server ID. Mailosaur is used for testing that emails have been sent by the system during automated integration tests. If you want to configure logz.io for centralized logging, do the same there.
2. Run `cp util/ssm-params-template.json /tmp/ssm-params.json`
3. Edit `/tmp/ssm-params.json` and fill out all parameters for the system. You can enter your Mailosaur and logz.io keys here.
4. The code secret for the sharing service should be a randomly-generated secret. This is used to sign and verify invitation codes.
5. The 'from-address' used by the email service specifies the 'From:' address for sent emails. More on this in the SES section below.
6. When you have entered all required parameters, run `util/create-ssm-params.js /tmp/ssm-params.json`

## 6. Configure SES

SLIC Starter uses SES to send and receive emails. If you want SES to be able to do that, you need to verify the sender and recipient's email address. You can also request a _Sending Limit Increase_ through SES. This will allow SES to send emails to _any_ recipient, including the randomly-generated Mailosaur email addresses used by the automated tests.

## 7. Create the deployment IAM role

```
cd cicd/cross-account
sls deploy
```

## 8. Deploy the CI/CD Pipeline

Ensure that AWS credentials are configured in your environment before running the deploy commands below.

1. `cd BASEDIR/cicd`
2. `npm run build`
3. `npm run cdk -- bootstrap`
4. `npm run deploy`

Your CI/CD pipeline is now deployed. You can verify this in the CodePipeline dashboard.

## 9. Trigger a Build

Make a commit to your repository. You can watch the CodePipeline job run. It will fail the first few times as services have inter-dependencies that will be resolved after repeated retries of failed stages. Once you have your first deployment working, this will no longer be the case.

## 10. Check your deployment

The deployed front-end application is now running and deployed. It is automatically configured to talk to the backend's APIs and Cognito user pool. To get the generated CloudFront name for the application, you can check the valu eof `/stg/frontend/url` in the Parameter Store. There is a handy script to print out all your (non-secret) parameters from SSM.

```

```

Go to the CloudFront address to load and use the deployed staging SLIC Lists application!

## 11. Make it your own!

Start making changes and transform SLIC Starter into your own application.

Let us know how you get on in the GitHub issues! We would love to hear from you and see any contributions you have to SLIC Starter.

# Local Development

```
npm install -g fuge
```
