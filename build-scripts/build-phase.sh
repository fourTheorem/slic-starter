#!/bin/bash

set -e

source module-config.env

run_build () {
	cd ${MODULE_NAME}
  if [ -e scripts/build.sh ]; then
    # Execute module-specific build
    bash scripts/build.sh
  fi
  source build-scripts/assume-cross-account-role.env
  echo "Packaging for SLIC_STAGE ${SLIC_STAGE}"
  mkdir -p build-artifacts/${SLIC_STAGE}
  SLIC_STAGE=${SLIC_STAGE} serverless package --package build-artifacts/${SLIC_STAGE} --stage ${SLIC_STAGE} -v
}

if [ $SKIP_MODULE -eq 0 ]; then
	run_build
else
	echo Skipping install for ${MODULE_NAME}
fi

