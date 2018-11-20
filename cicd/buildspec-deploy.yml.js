module.exports = () => `
version: 0.2

phases:
  pre_build:
    commands:
      - IMPERSONATION=$(aws sts assume-role --role-arn "arn:aws:iam::$\{self:custom.accountIds.dev}:role/slic-cicd-deployment-role" --role-session-name SLICCodeBuildDeploy --output text | tail -1)
      - export AWS_ACCESS_KEY_ID=$(echo $IMPERSONATION | awk '{print $2}')
      - export AWS_SECRET_ACCESS_KEY=$(echo $IMPERSONATION | awk '{print $4}')
      - export AWS_SESSION_TOKEN=$(echo $IMPERSONATION | awk '{print $5}')
      - printenv
      - npm install -g eoinsha/serverless#master

  build:
    commands:
      - aws sts get-caller-identity
      - aws s3 ls s3://slic-starter-build --debug
      - cd backend
      - SLS_DEBUG=* serverless deploy --verbose
`
