#!/bin/bash

set -e

pushd $(dirname $0)/..
npm ci --no-fund
popd
