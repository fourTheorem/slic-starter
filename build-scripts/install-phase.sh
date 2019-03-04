#!/bin/bash

set -e

source module-config.env

SKIP_MODULE=1
for i in "${CHANGED_FOLDERS[@]}"
do
	if [ "$i" == "." ] || [ "$i" == "$MODULE_NAME" ] ; then
		echo "Folder $i has changed. Proceeding with build for $MODULE_NAME"
		SKIP_MODULE=0
	fi
done

echo "SKIP_MODULE=${SKIP_MODULE}" >> module-config.env
