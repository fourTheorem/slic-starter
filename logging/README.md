# Centralized Logging

The Centralized Logging service enables developers to ship their logs from CloudWatch Logs to [Logz.io](https://logz.io).

## How this works
This service will deploy a [Lambda function](./logging/lambda_function.py), based on the [log.io shipper Lambda](https://github.com/logzio/logzio_aws_serverless/tree/master/cloudwatch). This Lambda function will take Cloudwatch Logs as inputs, and ship them to logz.io.  Each service subscribes itself to the logging function upon deployment using the [serverless-log-forwarding](https://github.com/amplify-education/serverless-log-forwarding) plugin.

## Getting Started
Before deploying this service, register and log into a logz.io account and find your **Logz.io API Token**

We need to add this token to AWS Systems Manager Parameter Store. Ths should be added manually since it is a *secret* and should not be committed to source control!

To do this, log into the AWS Management Console and navigate to Systems Manager (SSM). Under Shared Resources, navigate to Parameter Store.

Create a Secure String Parameter with the name `/<STAGE>/logging/logzio/token` (Replace `<STAGE>` with the stage you are configuring (stg, prod, etc.). Enter the value retrieved from your Logz.io account.

SLIC Starter Lambdas use [pino](https://github.com/pinojs/pino) as the logger, outputing structured JSON.

