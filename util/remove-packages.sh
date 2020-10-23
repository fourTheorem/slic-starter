#!/bin/bash

source $(dirname $0)/packages.env

pushd $(dirname $0)/..
rm -rf node_modules/
popd

for entry in ${PACKAGE_FILES}; do
  PACKAGE_DIR=$(dirname $entry)
  echo Removing node modules in ${PACKAGE_DIR}
  pushd ${PACKAGE_DIR}
  rm -rf node_modules/
  popd
done

