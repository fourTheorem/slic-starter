#!/usr/bin/env sh

#set -e

function wait_for() {
  tries=10
  found=false
  while ! $found -a $tries > 0; do
    echo Waiting for $1 \(tries $tries\)...
    wget -S -O /dev/null $1 2>&1 | grep -q 404
    if [ $? = 0 ]; then
      echo Found $1
      found=true
    else
      tries=$(expr $tries - 1)
      sleep 5
    fi
  done

  if [ ! $found ]; then
    echo Failed to find $1
    exit 1
  fi
}

export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=DUMMY_KEY_ID
export AWS_SECRET_ACCESS_KEY=DUMMY_KEY

BASEDIR=$(dirname $0)
source $BASEDIR/../localstack.env

wait_for ${SQS_ENDPOINT_URL}

aws --endpoint-url=$SQS_ENDPOINT_URL sqs create-queue --queue-name local-email-queue

wait_for ${SSM_ENDPOINT_URL}
aws --endpoint-url=$SSM_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/frontend/url", "Value": "http://localhost:3000"}'
aws --endpoint-url=$SSM_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/user-service/url", "Value": "http://localhost:4003/user/"}'
aws --endpoint-url=$SSM_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/user-service/user-pool-arn", "Value": "local-user-pool"}'
aws --endpoint-url=$SSM_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/sharing-service/code-secret", "Value": "password"}'
echo Done

