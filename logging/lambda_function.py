import gzip
import io
import json
import logging
import os
import base64
import boto3

from shipper import LogzioShipper

# set logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

#set boto3 client
ssm = boto3.client('ssm')
print('boto3 client set. Getting params')
logzio_token = ssm.get_parameter(Name='LogzioToken', WithDecryption=True)
logzio_url_base = ssm.get_parameter(Name='LogzioUrl')
logzio_type = ssm.get_parameter(Name='LogzioType')
logzio_format = ssm.get_parameter(Name='LogzioFormat')

def _extract_aws_logs_data(event):
    # type: (dict) -> dict
    try:
        logs_data_decoded = base64.b64decode(event['awslogs']['data'])
        logs_data_unzipped = gzip.GzipFile(fileobj=io.BytesIO(logs_data_decoded)).read()
        logs_data_dict = json.loads(logs_data_unzipped)
        return logs_data_dict
    except ValueError as e:
        logger.error("Got exception while loading json, message: {}".format(e))
        raise ValueError("Exception: json loads")


def _parse_cloudwatch_log(log, aws_logs_data):
    # type: (dict, dict) -> None
    if '@timestamp' not in log:
        log['@timestamp'] = str(log['timestamp'])
        del log['timestamp']

    log['message'] = log['message'].replace('\n', '')
    log['logStream'] = aws_logs_data['logStream']
    log['messageType'] = aws_logs_data['messageType']
    log['owner'] = aws_logs_data['owner']
    log['logGroup'] = aws_logs_data['logGroup']
    log['function_version'] = aws_logs_data['function_version']
    log['invoked_function_arn'] = aws_logs_data['invoked_function_arn']

    # If FORMAT is json treat message as a json
    try:
        if logzio_format['Params']['Value'] == 'json':
            json_object = json.loads(log['message'])
            for key, value in json_object.items():
                log[key] = value
    except (KeyError, ValueError):
        pass


def _enrich_logs_data(aws_logs_data, context):
    # type: (dict, 'LambdaContext') -> None
    try:
        aws_logs_data['function_version'] = context.function_version
        aws_logs_data['invoked_function_arn'] = context.invoked_function_arn
    except KeyError:
        pass


def lambda_handler(event, context):
    logzio_url = "{0}/?token={1}&type={2}".format(logzio_url_base['Parameter']['Value'], logzio_token['Parameter']['Value'], logzio_type['Parameter']['Value'])

    aws_logs_data = _extract_aws_logs_data(event)
    _enrich_logs_data(aws_logs_data, context)
    shipper = LogzioShipper(logzio_url)

    logger.info("About to send {} logs".format(len(aws_logs_data['logEvents'])))
    for log in aws_logs_data['logEvents']:
        if not isinstance(log, dict):
            raise TypeError("Expected log inside logEvents to be a dict but found another type")

        _parse_cloudwatch_log(log, aws_logs_data)
        shipper.add(log)

    shipper.flush()

