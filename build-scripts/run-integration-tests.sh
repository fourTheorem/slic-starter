#!/bin/bash
set -e
source `dirname $0`/assume-cross-account-role.env
npm test
