# CICD2

## GitHub Authentication.

Add a secret in Secrets Manager with `github-token` as the name.
https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html

## Bootstrapping
Uses _Modern_ bootstrapping: https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html#cdk-environment-bootstrapping

The following commands use AdministratorAccess for future CloudFormation deployments but this can be changed by specifying the CloudFormation execution policies:
```
--cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```
(Good to implement permissions boundaries in the execution role by bootstrapping with a custom template
https://github.com/aws-samples/aws-bootstrap-kit-examples/blob/ba28a97d289128281bc9483bcba12c1793f2c27a/source/1-SDLC-organization/lib/cdk-bootstrap-template.yml#L395)

#### Bootstrap the _target_ accounts
```
For each target account (dev, stg, prod)
npm run cdk -- bootstrap \
  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
  --trust=DEPLOYMENT_ACCOUNT_ID \
    aws://TARGET_ACCOUNT_ID/TARGET_REGION
```

#### Bootstrapping the deployment account
```
npm run cdk -- bootstrap \
  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
    aws://TARGET_ACCOUNT_ID/TARGET_REGION

```

# Create the Cross-Account Role in each target account
If the deployment account and the target account are the same, the `-c deploy-account=....` parameters can be omitted.

Set the AWS credentials to your target account (dev, stg, or prod).
Then run CDK deploy to create the cross-account deployment role in your target account.

```
npm run cdk -- -c stages=dev -c deploy-account=DEPLOYMENT_ACCOUNT_ID deploy CrossAccountStack
```

# Deploy the Pipeline

```
npm run build && npm run cdk -- -c stages=dev -c dev-account=TARGET_ACCOUNT_ID deploy PipelineStack
```

### What does Bootstrapping do?

It creates a CloudFormation stack ("CDKToolkit") with:

- A bucket for CDK assets and a bucket policy
- IAM Roles and Policies
- An ECR Repository
- A CloudFormation Execution Role
- An SSM Parameter with a CDK Bootstrap version

# Troubleshooting

Pipeline deployment fails with CREATE_FAILED: Internal failure.

-> Check that the secret, `github-token` is in place
