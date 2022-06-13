#!/bin/bash

set -e

source build-scripts/assume-cross-account-role.env

# This script assumes that `npm ci` or `npm install` has already been run in the root and the module
# Some modules may require a module-specific build
cd ${MODULE_NAME}
if [ -e ./scripts/build.sh ]; then
  bash ./scripts/build.sh
fi
