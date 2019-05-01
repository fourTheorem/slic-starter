#!/bin/bash

# This script finds the latest tagged release for a repo and
# compares this with a target commit.
# See this post for information: https://dev.to/eoinsha/find-changes-between-two-git-commits-without-cloning-4kkp

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
TOKEN_SECRET=$(aws secretsmanager get-secret-value --secret-id CICD --query SecretString)
GITHUB_TOKEN=$(echo $TOKEN_SECRET | node -e 'console.log(JSON.parse(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8"))).GitHubPersonalAccessToken)')
export REPO_URL=$(echo $REPO_URL | sed -e 's/https:\/\/github.com/https:\/\/'"$GITHUB_TOKEN@"'github.com/')

OUTPUT=$PWD/module-config.env

# rm -rf _GIT_REPO
# mkdir -p _GIT_REPO
# cd _GIT_REPO

# git init .																						  # Create an empty repository
# git remote add origin $REPO_URL													# Specify the remote repository

# Find the latest release using the format NUM.NUM.NUM. Anything else, like "1.2.3-pre" is assumed to not be a relase tag and is excluded
# Redirect STDERR to /dev/null as it will print out the Git remote URL including the access token
LATEST_RELEASE=`git ls-remote --tags 2>/dev/null | awk -F '/' '{print $3}' | grep -e '^[0-9]\+\.[0-9]\+.[0-9]\+$' | sort --version-sort | tail -1`
COMMIT_LOG=`git show -1`

if [ "$LATEST_RELEASE" = "" ]; then
  >&2 echo "No previous tagged release found. Changed folder assumed to be everything (.)"
  CHANGES="\"all_modules\":true"
else
  >&2 git checkout -b base                                     # Create a branch for our base state
  >&2 git fetch origin --depth 1 $LATEST_RELEASE               # Fetch the single commit for the base of our comparison
  >&2 git reset --hard FETCH_HEAD                              # Point the local master to the commit we just fetched

  >&2 git checkout -b target                                   # Create a branch for our target state

  >&2 git fetch origin --depth 1 $TARGET_VERSION               # Fetch the single commit for the target of our comparison
  >&2 git reset --hard FETCH_HEAD                              # Point the local target to the commit we just fetched

  CHANGES=""
  # Determine modules with files changed between the two commits
  git diff --name-only base target | grep / | awk 'BEGIN {FS="/"} {print $1}' | uniq | while read -r module
    do
      if [ "${CHANGES}" -ne "" ]; then
        CHANGES="${CHANGES},\n"
      fi
      CHANGES="\t\"${module}\":true"
    done
fi

printf -v ESC_MSG "%q\n" "$COMMIT_MSG" # Escape the commit log
OUTPUT_JSON="{\"changes\":{\n ${CHANGES}\n },\n\"buildId\":\"${CODEBUILD_BUILD_ID}\",\"resolvedVersion\":\"${CODEBUILD_RESOLVED_SOURCE_VERSION}\",\"sourceVersion\":\"${CODEBUILD_SOURCE_VERSION}\",\"commitLog\":\"${ESC_MSG}\"}"

echo done with output $OUTPUT_JSON

echo Invoking Step Function "${PIPELINE_STEP_FUNCTION_ARN}"
aws stepfunctions start-execution --state-machine-arn "${PIPELINE_STEP_FUNCTION_ARN}" --input "${OUTPUT_JSON}"
