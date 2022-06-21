#!/bin/bash

set -e
AUDIT_ARGS="--audit-level=high"

npm install -g npm@latest

if [ -e package.json ]; then
  echo npm audit ${AUDIT_ARGS}
else
  echo No root package.json, skipping audit
fi

cd packages/"${MODULE_NAME}"
if [ -e package.json ]; then
  # https://github.com/facebook/create-react-app/issues/11174
  AUDIT_ARGS="${AUDIT_ARGS} --production"
  echo Auditing with "${AUDIT_ARGS}"
  npm audit "${AUDIT_ARGS}"
else
  echo No module package.json, skipping audit
fi
