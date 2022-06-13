# CICD

This is a CDK project to create pipelines that can build and deploy the SLIC Starter application to AWS accounts.

It provides support for:
- A pipeline targeting staging (`stg`) and production (`prod`)
- Development pipelines that can be used to target any individual environment, like `dev`.

The pipelines are implemented using the AWS CodePipeline and CodeBuild service. They are designed to run in a separate AWS account to the target deployed environment, isolating them from the runtime environment.

## Getting started

AWS CDK (v2) should be installed in advance:

```
npm install --global aws-cdk@latest
```

The `cicd` project needs to have its modules installed:
```
npm install
```

Lastly, the TypeScript source needs to be compiled:
```
npm run build
```

## Deploying the pipelines

The following commands use AdministratorAccess for CloudFormation deployments but this can be changed by specifying the CloudFormation execution policies:
```
--cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```
(It is good to implement permissions boundaries in the execution role by bootstrapping with a custom template
https://github.com/aws-samples/aws-bootstrap-kit-examples/blob/ba28a97d289128281bc9483bcba12c1793f2c27a/source/1-SDLC-organization/lib/cdk-bootstrap-template.yml#L395)


Before you begin, you need to know:

1. The stages to which you are deploying. This can be a single stage, like `dev` or a set of stages like `stg,prod`. The latter means that the pipeline will first deploy to `stg` and then to `prod`.
2. The account IDs for the deployment account (`deploy`) and the target environments.

You can set these values as environment variables to avoid repeatedly typing/pasting them in subsequent commands.

```
export STAGES=stg,prod
export DEPLOY_ACCOUNT=0123456789009
export DEV_ACCOUNT=0123456789010
export STG_ACCOUNT=0123456789011
export PROD_ACCOUNT=0123456789012
```

Once this is in place, you can run the steps to create the pipeline. The steps are:

1. Bootstrap the deployment account
2. Bootstrap the target account(s)
3. Deploy the **cross-account stack(s)** in the target account(s)
4. Deploy the **pipeline stack** in the deployment account

Why all these steps? Well, because we are trying to strictly isolate our deployment and target environments, we need to set up foundations in multiple accounts. In order for services running in the _deployment_ account to access the _target_ account, an IAM Role must be created in the target account. This is a special role the deployment account will _[assume](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)_. Our CDK pipeline application creates a special "cross-account stack" containing this _cross-account role_.

CDK uses a process called _bootstrapping_ to create IAM roles and S3 buckets used to facilitate deployment.  This must be run in each account up front.

> 
> __What does Bootstrapping do?__
> 
> It creates a CloudFormation stack ("CDKToolkit") with:
> 
> - A bucket for CDK assets and a bucket policy
> - IAM Roles and Policies
> - An ECR Repository
> - A CloudFormation Execution Role
> - An SSM Parameter with a CDK Bootstrap version
> 

### Bootstrap the _target_ accounts

You only need to bootstrap the accounts you want to use. You can choose to deploy CICD and the application itself all in one account or you can have separate deployment, development, staging and production account.

#### Bootstrapping the deployment account

Using credentials for the deployment account:
```
cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
  aws://${DEPLOY_ACCOUNT}/eu-west-1 \
  --context stages=${STAGES} \
  --context deploy-account=${DEPLOY_ACCOUNT} \
  --context stg-account=${STG_ACCOUNT} \
  --context prod-account=${PROD_ACCOUNT}
```

#### Bootstrapping the development account
Using the _development_ account credentials:
```
cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
  aws://${DEV_ACCOUNT}/eu-west-1 \
  --context stages=dev \
  --context deploy-account=${DEPLOY_ACCOUNT} \
  --context dev-account=${DEV_ACCOUNT} \
  --trust=${DEPLOY_ACCOUNT}
```

#### Bootstrapping the staging account
Using the _staging_ account credentials:
```
cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
  aws://${STG_ACCOUNT}/eu-west-1 \
  --context stages=${STAGES} \
  --context deploy-account=${DEPLOY_ACCOUNT} \
  --context stg-account=${STG_ACCOUNT} \
  --context prod-account=${PROD_ACCOUNT} \
  --trust=${DEPLOY_ACCOUNT}
```

#### Bootstrapping the production account
Using the _production_ account credentials:
```
cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
  aws://${PROD_ACCOUNT}/eu-west-1 \
  --context stages=${STAGES} \
  --context deploy-account=${DEPLOY_ACCOUNT} \
  --context stg-account=${STG_ACCOUNT} \
  --context prod-account=${PROD_ACCOUNT} \
  --trust=${DEPLOY_ACCOUNT}
```
## Create the Cross-Account Role in each target account
This step will create roles in each target account that can be assumed by the deployment account during the deployment process.
If the deployment account and the target account are the same, the `-c deploy-account=....` parameters can be omitted.

Set the AWS credentials to your target account (dev, stg, or prod).
Then run CDK deploy to create the cross-account deployment role in that target account.

```
# Using development account credentials
npx cdk -c stages=dev -c deploy-account=${DEPLOY_ACCOUNT} deploy devCrossAccountStack

# Using staging account credentials
npx cdk -c stages=stg -c deploy-account=${DEPLOY_ACCOUNT} deploy stgCrossAccountStack

# Using production account credentials
npx cdk -c stages=prod -c deploy-account=${DEPLOY_ACCOUNT} deploy prodCrossAccountStack
```

## Deploy the Pipelines

To deploy a development CICD pipeline that targets the development account only:
```
npx cdk -c stages=dev -c dev-account=${DEV_ACCOUNT} deploy PipelineStack
```

To deploy a production CICD pipeline that targets the staging and production accounts:
```
npx cdk -c stages=stg,prod -c stg-account=${STG_ACCOUNT} -c prod-account=${PROD_ACCOUNT} -c deploy-account=${DEPLOY_ACCOUNT} deploy PipelineStack
```


Provided everything has gone to plan, you will not have to re-run these commands. The pipelines you have just deployed are _self-mutating_, so any changes in the pipeline code get deployed by the pipeline itself before any application code is deployed.

To deploy a separate pipeline for another development account, such as `dev2`, the same steps can be run, but the context variables will only include one target account (`--context dev2-account=${SANDBOX_ACCOUNT}`).

## Configure the Source Connection
Since we are using CodeStar Connections to fetch the source, this needs to be connected to your GitHub account. Until you do this, the pipeline will show that the source stage has failed.
In the AWS Management Console, navigate to `Developer Tools -> Connections -> devCodeStarConnection`. The connection status should show the value `Pending`. Select `Update Pending Connection` and connect to your GitHub account. You will need to select "Install a new app" and ensure it has the permissions to read the correct organisation/account and repository.
Once you click 'Connect', the connection status should show the value `Available`.

At this point, you can run the pipeline by browsing to the dev pipeline in the CodePipeline console and selecting 'Release Change'.
