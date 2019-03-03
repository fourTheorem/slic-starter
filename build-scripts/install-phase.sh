#!/bin/bash

set -e

source module-config.env

if [ $SKIP_MODULE -ne 0]; then
	run_pre_build
else
	echo Skipping pre_build for ${MODULE_NAME}
fi

run_pre_build () {
	cd ${MODULE_NAME}
	npm t
}
