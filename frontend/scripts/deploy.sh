#!/bin/bash
set -e

SCRIPTS_DIR=$(realpath $(dirname $0))

sls deploy --stage $STAGE --region ${TARGET_REGION}

aws cloudfront create-invalidation --distribution-id ${distribution_ID} --paths "/*"

echo frontend deploy.sh