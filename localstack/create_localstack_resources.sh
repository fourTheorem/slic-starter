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

wait_for ${LOCALSTACK_ENDPOINT_URL}

aws --endpoint-url=$LOCALSTACK_ENDPOINT_URL sqs create-queue --queue-name local-email-queue

ALARM_TOPIC_ARN=$(aws --endpoint-url=$LOCALSTACK_ENDPOINT_URL sns create-topic --name alarm-topic --output text --query "TopicArn")

aws --endpoint-url=$LOCALSTACK_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/frontend/url", "Value": "http://localhost:3000"}'
aws --endpoint-url=$LOCALSTACK_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/user-service/url", "Value": "http://localhost:4003/user/"}'
aws --endpoint-url=$LOCALSTACK_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/user-service/user-pool-arn", "Value": "local-user-pool"}'
aws --endpoint-url=$LOCALSTACK_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/sharing-service/code-secret", "Value": "password"}'
aws --endpoint-url=$LOCALSTACK_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/slicWatch/topicArn", "Value": "${ALARM_TOPIC_ARN}"}'
echo Done

