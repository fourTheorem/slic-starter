#!/bin/bash

echo ORCHESTRATOR STAGE DEPLOY
echo ENV 
env

echo PWD
pwd

echo PIPELINE STATE
cat pipeline-state.env

source pipeline-state.env

export S3_FULL_PATH=$(echo ${CODEBUILD_SOURCE_VERSION} | awk -F ':' '{print $6}')
export S3_BUCKET_NAME=$(echo ${S3_FULL_PATH} | sed -e 's/\([^\/]*\)\/.*/\1/')
export ARTIFACT_OBJECT_KEY=$(echo $S3_FULL_PATH| sed -e 's/[^\/]*\/\(.*\)/\1/')

echo "Got bucket ${S3_BUCKET_NAME} from full path ${S3_FULL_PATH} from version ${CODEBUILD_SOURCE_VERSION}"
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
