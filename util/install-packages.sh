#!/bin/bash

set -e

source $(dirname $0)/packages.env

pushd $(dirname $0)/..
npm ci
popd

for entry in ${PACKAGE_FILES}; do
  PACKAGE_DIR=$(dirname $entry)
  echo Preparing ${PACKAGE_DIR}
  pushd ${PACKAGE_DIR}
  npm ci
  popd
done

