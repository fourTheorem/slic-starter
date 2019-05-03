#!/bin/bash

set -e

run_build () {
  source build-scripts/assume-cross-account-role.env
	cd ${MODULE_NAME}
  if [ -e scripts/build.sh ]; then
    # Execute module-specific build
    bash scripts/build.sh
  fi
  echo "Packaging for SLIC_STAGE ${SLIC_STAGE}"
  mkdir -p build-artifacts/${SLIC_STAGE}
  SLIC_STAGE=${SLIC_STAGE} serverless package --package build-artifacts/${SLIC_STAGE} --stage ${SLIC_STAGE} -v
}

run_build
