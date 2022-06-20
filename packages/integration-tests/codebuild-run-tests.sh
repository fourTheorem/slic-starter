#!/bin/bash
set -e

source ../build-scripts/assume-cross-account-role.env
npm test

