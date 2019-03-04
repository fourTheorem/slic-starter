#!/bin/bash

set -e

source module-config.env

run_pre_build () {
	cd ${MODULE_NAME}
	npm install
  npm test
}

if [ $SKIP_MODULE -eq 0 ]; then
	run_pre_build
else
	echo Skipping pre_build for ${MODULE_NAME}
fi

