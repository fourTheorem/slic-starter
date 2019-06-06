import gzip
import io
import json
import logging
import base64
import boto3

from shipper import LogzioShipper

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ssm = boto3.client('ssm')


logzio_param_list = ssm.get_parameters_by_path(
        Path='/logging/logzio',
        WithDecryption=True
        )['Parameters']
logzio_params = {
        logzio_param_list[i]['Name']: logzio_param_list[i]['Value']
        for i in range(0, len(logzio_param_list))
        }
logzio_url_base = logzio_params['/logging/logzio/url']
logzio_type = logzio_params['/logging/logzio/type']
logzio_format = logzio_params['/logging/logzio/format']
logzio_token = logzio_params['/logging/logzio/token']


def _extract_aws_logs_data(event):
    try:
        logs_data_decoded = base64.b64decode(event['awslogs']['data'])
        logs_data_unzipped = gzip.GzipFile(
                fileobj=io.BytesIO(logs_data_decoded)
                ).read()
        logs_data_dict = json.loads(logs_data_unzipped)
        return logs_data_dict
    except ValueError as e:
        logger.error('Got exception while loading json, message: {}'.format(e))
        raise ValueError('Exception: json loads')


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
        if logzio_format == 'json':
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
    logzio_url = '{0}/?token={1}&type={2}'.format(
            logzio_url_base, logzio_token, logzio_type
            )

    aws_logs_data = _extract_aws_logs_data(event)
    _enrich_logs_data(aws_logs_data, context)
    shipper = LogzioShipper(logzio_url)

    logger.info('About to send {} logs'.format(
        len(aws_logs_data['logEvents']))
        )
    for log in aws_logs_data['logEvents']:
        if not isinstance(log, dict):
            raise TypeError('Expected log inside logEvents to be a dict but found another type')

        _parse_cloudwatch_log(log, aws_logs_data)
        shipper.add(log)

    shipper.flush()
