#!/bin/bash
set -e

cd $(dirname $0)
sls deploy --stage $STAGE

export DISTRIBUTION_ID=$(aws cloudfront list-distributions --query 'DistributionList.Items[0].Id' --output text)
export INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id=$DISTRIBUTION_ID --paths '/*' --query 'Invalidation.Id' --output text)
aws cloudfront wait invalidation-completed --distribution-id=$DISTRIBUTION_ID --id=$INVALIDATION_ID --no-cli-pager
echo 'Deployment and cache invalidation complete :)'