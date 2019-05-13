#!/bin/bash

set -a 

echo PIPELINE STATE:
cat pipeline-state.env

source pipeline-state.env

export S3_FULL_PATH=$(echo ${CODEBUILD_SOURCE_VERSION} | awk -F ':' '{print $6}')
export S3_BUCKET_NAME=$(echo ${S3_FULL_PATH} | sed -e 's/\([^\/]*\)\/.*/\1/')
export ARTIFACT_OBJECT_KEY=$(echo $S3_FULL_PATH| sed -e 's/[^\/]*\/\(.*\)/\1/')

declare -A pipelineExecutionIds
for moduleName in ${MODULE_NAMES}; do
  if ${changedModules[${moduleName}]}; then
    echo Copying artifact to trigger build of ${moduleName}
    CMD="aws s3 cp s3://${S3_BUCKET_NAME}/${ARTIFACT_OBJECT_KEY} s3://${S3_BUCKET_NAME}/${SLIC_STAGE}_module_pipelines/module_source/${moduleName}.zip"
    echo Executing ${CMD}
    ${CMD}
    pipelineExecutionIds[${moduleName}]=$(aws codepipeline start-pipeline-execution --name ${moduleName}_stg_pipeline --query "pipelineExecutionId" --output text)
  else 
    echo Skipping unchanged module ${moduleName}
  fi
done

allSucceeded=true
anyFailed=false

checkExecutions() {
  for moduleName in ${MODULE_NAMES}; do
    if [[ ${changedModules[${moduleName}]} = true ]]; then
      status=$(aws get-pipeline-execution --pipeline-name ${moduleName}_stg_pipeline --pipeline-execution-id ${pipelineExecutionIds[${moduleName}]}  --query pipelineExecution.status --output text)
      echo "${moduleName} has status ${status}"
      if [[ $allSucceeded = true && "$status" = "Succeeded" ]]; then
        allSucceeded=true
      else
        allSucceeded=false
      fi
      if [[ "$status" = "Failed" ]]; then
        anyFailed=true
      fi
    fi
  done
}

checkExecutions
while [[ $allSucceeded = true && $anyFailed != true ]]; do
  sleep 10
  checkExecutions
done

echo Done - Any failed? $anyFailed
if [[ $anyFailed = true ]]; then
  exit 10
fi
exit 0