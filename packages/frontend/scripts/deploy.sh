#!/bin/bash
set -Eeuox pipefail

if [[ -z "${STAGE}" ]]; then
  echo STAGE must be set
  exit 1
fi
if [[ -z "${TARGET_REGION}" ]]; then
  echo TARGET_REGION must be set
  exit 1
fi

# Ensure we are in the frontend directory first
SCRIPTS_DIR=$(dirname $0)
cd $SCRIPTS_DIR/..
echo Deploying serverless package...
sls deploy --stage $STAGE --region ${TARGET_REGION}

echo Invalidating CloudFront distribution...
export DISTRIBUTION_ID=$(aws cloudfront list-distributions --query 'DistributionList.Items[0].Id' --output text)
export INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id=$DISTRIBUTION_ID --paths '/*' --query 'Invalidation.Id' --output text)
aws cloudfront wait invalidation-completed --distribution-id=$DISTRIBUTION_ID --id=$INVALIDATION_ID --no-cli-pager

echo CloudFront distribution has been invalidated with invalidation ID: ${INVALIDATION_ID}
