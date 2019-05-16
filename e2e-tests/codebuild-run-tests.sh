#!/bin/bash
set -e

echo MAILOSAUR API KEY is ${MAILOSAUR_API_KEY}
source ../build-scripts/assume-cross-account-role.env
npm run headless

