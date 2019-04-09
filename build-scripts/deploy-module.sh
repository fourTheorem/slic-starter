#!/bin/bash

set -e

source module-config.env

run_deploy () {
  source build-scripts/assume-cross-account-role.env
	cd ${MODULE_NAME}
  serverless deploy --stage ${SLIC_STAGE} --package build-artifacts/${SLIC_STAGE} --force
}

if [ $SKIP_MODULE -eq 0 ]; then
	run_deploy
else
	echo Skipping deploy for ${MODULE_NAME}
fi

