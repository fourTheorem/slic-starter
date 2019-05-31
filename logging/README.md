# Centralized Logging

The Centralized Logging service enables developers to ship their logs from CloudWatch Logs to Logz.io. 

## How this works
This service will deploy a lambda function located in `/logging/lambda_function.py` 
This lambda function will take Cloudwatch Logs as inputs, and ship them to Logz.io

## Getting Started
Before deploying this service, log into your logz.io account and find your **Logz.io API Token**.
You will also need to decide on a **Log Format** (json or text), **Logz.io Listener URL** and a **Log Type**. You can find a list of the supported log types here: https://docs.logz.io/user-guide/log-shipping/built-in-log-types.html

We need to add these parameters to AWS Systems Manager.
To do this, log into your AWS Console and navigate to Systems Manager (SSM). Under Shared Resources navigate to Parameter Store.
* Create a Secure String Parameter with the name 'LogzioToken'. Enter the value retrieved from your Logz.io account
* Create a String Parameter for each of the following: 'LogzioUrl', 'LogzioType', 'LogzioFormat'.

## Deployment
Navigate to the logging directory with `cd logging/`
Deploy the logging service with `AWS_PROFILE=profile SLIC_STAGE=stage sls deploy`
