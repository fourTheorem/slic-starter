module.exports = buildCommands => `
version: 0.2

phases:
  pre_build:
    commands:
      - IMPERSONATION=$(aws sts assume-role --role-arn "arn:aws:iam::$\{self:custom.accountIds.dev}:role/slic-cicd-deployment-role" --role-session-name SLICCodeBuildDeploy --output text | tail -1)
      - export AWS_ACCESS_KEY_ID=$(echo $IMPERSONATION | awk '{print $2}')
      - export AWS_SECRET_ACCESS_KEY=$(echo $IMPERSONATION | awk '{print $4}')
      - export AWS_SESSION_TOKEN=$(echo $IMPERSONATION | awk '{print $5}')
      - export SLIC_STAGE=dev
      - npm install -g serverless

  build:
    commands:
${buildCommands}
`
