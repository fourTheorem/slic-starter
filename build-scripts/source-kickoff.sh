#!/bin/bash

# This script finds the latest tagged release for a repo and
# compares this with a target commit.

STATE_FILE=${PWD}/pipeline-state.env
LOCAL_DEPLOYMENT_STATE=/tmp/deployment-state.env

aws s3 cp s3://${DEPLOYMENT_STATE_BUCKET}/${DEPLOYMENT_STATE_KEY} ${LOCAL_DEPLOYMENT_STATE}

set -e

REPO_URL=$1
TARGET_VERSION=$2

if [ "$REPO_URL" = "" ] || [ "$TARGET_VERSION" = "" ]; then
  >&2 printf "\
Usage: \n\n\
$0 repository_url target_version \n\
  repository_url             Git repository URL \n\
  target_version             The SHA, branch or tag to compare to\n\n"
  exit 1
fi

if [ -e ${LOCAL_DEPLOYMENT_STATE} ]; then
  source ${LOCAL_DEPLOYMENT_STATE}
  echo Deployment state found. Deployed version is ${DEPLOYED_RELEASE}
else
  echo No deployment state found
fi

declare -A changedModules

find . -maxdepth 1 -type d -not -path "./.*" | awk -F '/' '{print $2}' | grep -ve "^$" > /tmp/all-paths
while read -r module
do
  changedModules[${module}]=false
done < /tmp/all-paths

if [ "$DEPLOYED_RELEASE" = "" ]; then
  >&2 echo "No previous tagged release found. Changed folder assumed to be everything (.)"
  for key in "${!changedModules[@]}"; do
    changedModules[${key}]=true
  done
else
  # Determine modules with files changed between the two commits
  git diff --name-only $DEPLOYED_RELEASE $TARGET_VERSION | grep / | awk 'BEGIN {FS="/"} {print $1}' | uniq > /tmp/changed-paths
  while read -r module
  do
    changedModules[${module}]=true
  done < /tmp/changed-paths
fi

export ORIGINAL_CODEBUILD_SOURCE_VERSION=${CODEBUILD_SOURCE_VERSION}

echo > ${STATE_FILE}
for var in changedModules CODEBUILD_BUILD_ID COMMIT_LOG ORIGINAL_CODEBUILD_SOURCE_VERSION; do
cat >> ${STATE_FILE} << EOF
$(declare -p ${var})
export ${var}
EOF
done

echo done with state $(cat ${STATE_FILE})
