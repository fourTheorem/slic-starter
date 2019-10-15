#!/bin/bash

set -e

source pipeline-state.env

echo Commit log was ${COMMIT_LOG}
echo Updating deployment state to deployed version ${ORIGINAL_CODEBUILD_SOURCE_VERSION}

LOCAL_DEPLOYMENT_STATE=/tmp/deployment-state.env
export DEPLOYED_RELEASE=${ORIGINAL_CODEBUILD_SOURCE_VERSION}

cat > ${LOCAL_DEPLOYMENT_STATE} << EOF
$(declare -p DEPLOYED_RELEASE COMMIT_LOG CODEBUILD_BUILD_ID)
export DEPLOYED_RELEASE COMMIT_LOG CODEBUILD_BUILD_ID
EOF

echo Uploading deployment state with contents:
cat ${LOCAL_DEPLOYMENT_STATE}
echo ----

aws s3 cp ${LOCAL_DEPLOYMENT_STATE} s3://${DEPLOYMENT_STATE_BUCKET}/${DEPLOYMENT_STATE_KEY}

