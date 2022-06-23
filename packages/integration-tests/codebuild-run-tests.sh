#!/bin/bash
set -Eeuxo pipefail

source ../../build-scripts/assume-cross-account-role.env
npm test

