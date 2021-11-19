# CICD2

## GitHub Authentication.

Add a secret in Secrets Manager with `github-token` as the name.
https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html

## Bootstrapping
Uses _Modern_ bootstrapping: https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html#cdk-environment-bootstrapping

```
npm run cdk -- bootstrap aws://1234567890123/eu-west-1
```

This uses AdministratorAccess for future CloudFormation deployments but this can be changed by specifying the CloudFormation execution policies:
```
--cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess 
```
(Good to implement permissions boundaries in the execution role by bootstrapping with a custom template
https://github.com/aws-samples/aws-bootstrap-kit-examples/blob/ba28a97d289128281bc9483bcba12c1793f2c27a/source/1-SDLC-organization/lib/cdk-bootstrap-template.yml#L395)

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
