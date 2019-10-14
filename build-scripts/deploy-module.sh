#!/bin/bash

set -e

source build-scripts/assume-cross-account-role.env
cd ${MODULE_NAME}
../node_modules/serverless/bin/serverless deploy --stage ${SLIC_STAGE} --region ${TARGET_REGION} --package build-artifacts/${SLIC_STAGE} --force
