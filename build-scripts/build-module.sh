#!/bin/bash

set -e

source build-scripts/assume-cross-account-role.env
cd ${MODULE_NAME}
if [ -e package.json ]; then
  npm install
  npm test
else
  echo No package.json, skipping NPM execution
fi

# Optional, module-specific build
if [ -e ./scripts/build.sh ]; then
  bash ./scripts/build.sh
fi
