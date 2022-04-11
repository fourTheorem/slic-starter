#!/bin/bash
set -e

SCRIPTS_DIR=$(realpath $(dirname $0))

sls deploy --stage $STAGE --region ${TARGET_REGION}

aws cloudfront list-distributions --query "DistributionList.Items[*].{id:Id,origin:Origins.Items[0].Id}[?origin=='S3-BUCKET_NAME'].id" --output text

echo frontend deploy.sh