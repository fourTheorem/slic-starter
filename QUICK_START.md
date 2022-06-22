# SLIC Starter Quick Start!

This guide gets you up and running with a running SLIC Starter environment as quickly as possible.

This setup is faster than the full, domain-based, multi-account setup because:

1. No domains and certificates are provisioned. These steps require approval and DNS propagation time
2. Everything is deployed to a single AWS account - CI/CD, staging and production.

# Prerequisites

- Node v16 or later should be installed locally.
- The Serverless Framework v3 should be installed:

```
npm install serverless@3 -g
```

# Steps

## 1. Fork and clone the repository

You should work within your own clone/fork of the repository so you can freely commit and push changes.

1. Fork the repository on GitHub
2. Clone the forked repository

## 2. Install packages

This project utilises  [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces). You should run `npm ci` in the root directory to install all package dependencies.

## 3. Deploy the pipeline with CDK

```
cd cicd
```

We are going to deploy the pipeline and the application in one account for the Quick Start method.
```
export STAGES=dev
export DEPLOY_ACCOUNT=<ACCOUNT_ID>
export DEV_ACCOUNT=<ACCOUNT_ID>
```
```
cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
  aws://${DEPLOY_ACCOUNT}/eu-west-1 \
  --context stages=${STAGES}
```

## 3. Configure your target AWS account

Edit `app.yml` carefully, reading all the instructions and ensuring the values match your GitHub repo and setup.
1. Set `nsDomain` to an empty 'string'
2. Specify a new value for `siteBucketPrefix`. This should be unique to your deployment! If the `siteBucketPrefix` value is `my-slic-app`, the bucket name created to host the production site will be `my-slic-app-prod`.
3. Change repository owner and name to point to _your_ fork of the SLIC Starter repo. This is important if you want your application to be continuously deployed from your code!
4. Set `slicWatch.enabled` to `false`. The value for `topicArn` should be an empty string ('').

## 4. Configure secrets and parameters
If you wish, this step can be deferred until you have problems with deployment and tests failing due to missing configuration.

1. Create an account on mailosaur.com and grab the API key and server ID. Mailosaur is used for testing that emails have been sent by the system during automated integration tests.
2. Run `cp util/ssm-params-template-dev.json /tmp/ssm-params.json`
3. Edit `/tmp/ssm-params.json` and fill out all parameters for the system. You can enter your Mailosaur keys here.
4. The code secret for the sharing service should be a randomly-generated secret. This is used to sign and verify invitation codes.
5. The 'from-address' used by the email service specifies the 'From:' address for sent emails. More on this in the SES section below.
6. When you have entered all required parameters, run the following command to create the parameters in Systems Manager Parameters Store.
```
util/create-ssm-params.js /tmp/ssm-params.json
``

## 5. Configure SES

SLIC Starter uses SES to send and receive emails. If you want SES to be able to do that, you need to verify the sender and recipient's email address. You can also request a _Sending Limit Increase_ through SES. This will allow SES to send emails to _any_ recipient, including the randomly-generated Mailosaur email addresses used by the automated tests.

## 6. Deploy the CI/CD Pipeline

Ensure that AWS credentials are configured in your environment before running the deploy commands below.

1. `cd BASEDIR/packages/cicd`
4. `npx cdk -c stages=${STAGES} deploy PipelineStack`


Your CI/CD pipeline is now deployed. You can verify this in the CodePipeline dashboard.

## 7. Configure the Source Connection
Since we are using CodeStar Connections to fetch the source, this needs to be connected to your GitHub account. Until you do this, the pipeline will show that the source stage has failed.
In the AWS Management Console, navigate to `Developer Tools -> Connections -> devCodeStarConnection`. The connection status should show the value `Pending`. Select `Update Pending Connection` and connect to your GitHub account. You will need to select "Install a new app" and ensure it has the permissions to read the correct organisation/account and repository.
Once you click 'Connect', the connection status should show the value `Available`.

At this point, you can run the pipeline by browsing to the dev pipeline in the CodePipeline console and selecting 'Release Change'.

## 9. Check your deployment

The deployed front-end application is now running and deployed. It is automatically configured to talk to the backend's APIs and Cognito user pool. To get the generated CloudFront name for the application, you can check the value of `/stg/frontend/url` in the Parameter Store. There is a handy script to print out all your (non-secret) parameters from SSM.

```
./util/show-ssm-params.js
```

Go to the CloudFront address to load and use the deployed staging SLIC Lists application!

## 11. Make it your own!

Start making changes and transform SLIC Starter into your own application.

Let us know how you get on in the GitHub issues! We would love to hear from you and see any contributions you have to SLIC Starter.

