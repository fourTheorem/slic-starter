#!/bin/bash
set -Eeuox pipefail

source ../../build-scripts/assume-cross-account-role.env
npm test

