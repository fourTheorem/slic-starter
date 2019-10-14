#!/bin/bash

set -e

cd ${MODULE_NAME}
if [ -e package.json ]; then
  npm audit --audit-level=moderate 
else
  echo No package.json, skipping audit
fi