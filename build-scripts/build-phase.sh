#!/bin/bash

set -e

source module-config.env

run_build () {
	cd ${MODULE_NAME}
  npm install -g serverless
  # TODO - Change stage to stg and prod as appropriate
  # (or each configured/injected stage)
  export SLIC_STAGE=dev
  mkdir -p build-artifacts/${SLIC_STAGE}
  serverless package --package build-artifacts/${SLIC_STAGE} --stage ${SLIC_STAGE} -v
}

if [ $SKIP_MODULE -eq 0 ]; then
	run_build
else
	echo Skipping install for ${MODULE_NAME}
fi

