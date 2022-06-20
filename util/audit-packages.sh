#!/bin/bash

pushd $(dirname $0)/..
npm audit "${@:1}"
popd
