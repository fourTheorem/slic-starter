#!/bin/bash

set -e

npm install -g npm@latest

if [ -e package.json ]; then
  npm audit --audit-level=moderate
else
  echo No root package.json, skipping audit
fi

cd ${MODULE_NAME}
if [ -e package.json ]; then
  npm audit --audit-level=moderate
else
  echo No module package.json, skipping audit
fi
