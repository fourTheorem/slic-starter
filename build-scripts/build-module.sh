#!/bin/bash

set -e

source build-scripts/assume-cross-account-role.env

if [ -e package.json ]; then
  npm ci
else
  echo No root package.json, skipping npm ci
fi

cd ${MODULE_NAME}
if [ -e package.json ]; then
  npm ci
  npm test
else
  echo No module package.json, skipping npm ci
fi

# Optional, module-specific build
if [ -e ./scripts/build.sh ]; then
  bash ./scripts/build.sh
fi
