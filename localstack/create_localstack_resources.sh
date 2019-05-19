#!/usr/bin/env sh

# Wait for localstack to be available
sleep 4.5

export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=DUMMY_KEY_ID
export AWS_SECRET_ACCESS_KEY=DUMMY_KEY

BASEDIR=$(dirname $0)
source $BASEDIR/../localstack.env

aws --endpoint-url=$SSM_ENDPOINT_URL ssm put-parameter --type String --name UserServiceUrl --cli-input-json '{"Type": "String", "Name": "UserServiceUrl", "Value": "http://localhost:4003/user/"}'
aws --endpoint-url=$SQS_ENDPOINT_URL sqs create-queue --queue-name dev-email-queue
echo Done

