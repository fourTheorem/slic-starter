#!/bin/bash

set -e

source module-config.env

run_deploy () {
	cd ${MODULE_NAME}
  # TODO - Take account ID for target from environment
  IMPERSONATION=$(aws sts assume-role --role-arn "arn:aws:iam::935672627075:role/slic-cicd-deployment-role" --role-session-name SLICCodeBuildDeploy --output text | tail -1)
  AWS_ACCESS_KEY_ID=$(echo $IMPERSONATION | awk '{print $2}')
  AWS_SECRET_ACCESS_KEY=$(echo $IMPERSONATION | awk '{print $4}')
  AWS_SESSION_TOKEN=$(echo $IMPERSONATION | awk '{print $5}')

  export SLIC_STAGE=dev # TODO - Change this to pipeline-dependent build
  # TODO Dynamic stage (stg/prod)
  serverless deploy --stage ${SLIC_STAGE} --package build-artifacts/${SLIC_STAGE}
}

if [ $SKIP_MODULE -eq 0 ]; then
	run_deploy
else
	echo Skipping deploy for ${MODULE_NAME}
fi

