#!/bin/bash

echo ORCHESTRATOR STAGE DEPLOY
echo ENV 
env

echo PWD
pwd

echo PIPELINE STATE
cat pipeline-state.env

source pipeline-state.env

CODEBUILD_SOURCE_VERSION=arn:aws:s3:::slic-build-artifacts-285982925560-eu-west-1/OrchestratorPipeline/Artifact_S/OQofDC1.zip 
S3_FULL_PATH=$(echo ${CODEBUILD_SOURCE_VERSION} | awk -F ':' '{print $6}')
S3_BUCKET_NAME=$(echo ${S3_FULL_PATH} | sed -e 's/\([^\/]*\)\/.*/\1/')
ARTIFACT_OBJECT_KEY=$(echo $S3_FULL_PATH| sed -e 's/[^\/]*\/\(.*\)/\1/')

bash -version

for moduleName in ${MODULE_NAMES}; do
  if ${changedModules[${moduleName}]}; then
    echo Copying artifact to trigger build of ${moduleName}
    CMD="aws s3 cp s3://${S3_BUCKET_NAME}/${ARTIFACT_OBJECT_KEY} s3://${S3_BUCKET_NAME}/${SLIC_STAGE}_module_pipelines/module_source/${moduleName}.zip"
    echo Executing ${CMD}
    ${CMD}
  else 
    echo Skipping unchanged module ${moduleName}
  fi
done
