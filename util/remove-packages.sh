#!/bin/bash

source $(dirname $0)/packages.env

pushd $(dirname $0)/..
echo Removing node modules in root and workspace packages
rm -rf node_modules/
npm exec --workspaces --call "rm -rf node_modules"
popd

