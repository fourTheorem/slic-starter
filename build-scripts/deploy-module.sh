#!/bin/bash

set -e

source module-config.env

run_deploy () {
  source build-scripts/assume-cross-account-role.env
	cd ${MODULE_NAME}
  export SLIC_STAGE=dev # TODO - Change this to pipeline-dependent build
  # TODO Dynamic stage (stg/prod)
  serverless deploy --stage ${SLIC_STAGE} --package build-artifacts/${SLIC_STAGE}
}

if [ $SKIP_MODULE -eq 0 ]; then
	run_deploy
else
	echo Skipping deploy for ${MODULE_NAME}
fi

