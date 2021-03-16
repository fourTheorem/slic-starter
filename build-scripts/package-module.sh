#!/bin/bash

set -e

source build-scripts/assume-cross-account-role.env
cd ${MODULE_NAME}
echo "Packaging for SLIC_STAGE ${SLIC_STAGE}"
mkdir -p build-artifacts/${SLIC_STAGE}
SLIC_STAGE=${SLIC_STAGE} npx serverless package --package build-artifacts/${SLIC_STAGE} --stage ${SLIC_STAGE} -v
