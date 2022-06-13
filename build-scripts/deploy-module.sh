#!/bin/bash

set -e

source build-scripts/assume-cross-account-role.env
cd ${MODULE_NAME}
if [ "${MODULE_NAME}" == "certs" ]; then
  # serverless will override provider.stage with the `--region` setting but `certs` must be deployed in us-east-1
  TARGET_REGION="us-east-1"
fi

../node_modules/serverless/bin/serverless.js deploy --stage ${SLIC_STAGE} --region ${TARGET_REGION} --force
