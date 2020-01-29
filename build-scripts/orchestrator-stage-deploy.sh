#!/bin/bash

set -e

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
    pipelineExecutionIds[${moduleName}]=$(aws codepipeline start-pipeline-execution --name ${moduleName}_${SLIC_STAGE}_pipeline --query "pipelineExecutionId" --output text)
    echo "Pipeline execution ID for ${moduleName} is ${pipelineExecutionIds[${moduleName}]}"
  else
    echo Skipping unchanged module ${moduleName}
  fi
done

checkExecutions() {
  anyFailed=false
  anyInProgress=false
  allSucceeded=true
  for moduleName in ${MODULE_NAMES}; do
    if [[ ${changedModules[${moduleName}]} = true ]]; then
      status=$(aws codepipeline get-pipeline-execution --pipeline-name ${moduleName}_${SLIC_STAGE}_pipeline --pipeline-execution-id ${pipelineExecutionIds[${moduleName}]}  --query pipelineExecution.status --output text)
      echo ${moduleName} status is ${status}
      if [[ $allSucceeded = true && "$status" = "Succeeded" ]]; then
        allSucceeded=true
      else
        allSucceeded=false
      fi

      if [[ "$status" = "InProgress" ]]; then
        anyInProgress=true
      fi

      if [[ "$status" = "Failed" ]]; then
        anyFailed=true
        echo "${moduleName} failed. Check https://${AWS_DEFAULT_REGION}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${moduleName}_${SLIC_STAGE}_pipeline/executions/${pipelineExecutionIds[${moduleName}]}/timeline?region=${AWS_DEFAULT_REGION}"
      fi
    fi
  done
}

sleep 10
checkExecutions
while [[ $anyInProgress = true ]]; do
  echo "In progres: allSucceeded ? $allSucceeded, anyFailed? $anyFailed"
  sleep 10
  checkExecutions
done

echo Done - Any failed? $anyFailed
if [[ $anyFailed = true ]]; then
  exit 10
fi
exit 0
