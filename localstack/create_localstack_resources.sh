#!/usr/bin/env sh

set -e

# Wait for localstack to be available
sleep 4.5

export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=DUMMY_KEY_ID
export AWS_SECRET_ACCESS_KEY=DUMMY_KEY

BASEDIR=$(dirname $0)
source $BASEDIR/../localstack.env

aws --endpoint-url=$SSM_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/user-service/url", "Value": "http://localhost:4003/user/"}'
aws --endpoint-url=$SSM_ENDPOINT_URL ssm put-parameter --cli-input-json '{"Type": "String", "Name": "/local/sharing-service/code-secret", "Value": "password"}'
aws --endpoint-url=$SQS_ENDPOINT_URL sqs create-queue --queue-name local-email-queue
echo Done

