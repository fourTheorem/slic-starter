#!/bin/bash

set -e

cd ${MODULE_NAME}
if [ -e package.json ]; then
  npm install
  npm test
else
  echo No package.json, skipping NPM execution
fi