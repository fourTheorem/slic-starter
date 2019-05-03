#!/bin/bash

set -e

run_pre_build () {
	cd ${MODULE_NAME}
  if [ -e package.json ]; then
    npm install
    npm test
  else
    echo No package.json, skipping NPM execution
  fi
}

run_pre_build
