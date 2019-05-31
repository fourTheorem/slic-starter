import json
import logging
import sys
import time
import requests

MAX_BULK_SIZE_IN_BYTES = 1 * 1024 * 1024  # 1 MB

# set logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)


class MaxRetriesException(Exception):
    pass


class UnauthorizedAccessException(Exception):
    pass


class BadLogsException(Exception):
    pass


class UnknownURL(Exception):
    pass


class LogzioShipper(object):
    MAX_BULK_SIZE_IN_BYTES = 1 * 1024 * 1024

    def __init__(self, logzio_url):
        self._size = 0
        self._logs = []
        self._logzio_url = logzio_url

    def add(self, log):
        # type: (dict) -> None
        json_log = json.dumps(log)
        self._logs.append(json_log)
        self._size += sys.getsizeof(json_log)
        self._try_to_send()

    def _reset(self):
        self._size = 0
        self._logs = []

    def _try_to_send(self):
        if self._size > self.MAX_BULK_SIZE_IN_BYTES:
            self._send_to_logzio()
            self._reset()

    def flush(self):
        if self._size:
            self._send_to_logzio()
            self._reset()

    @staticmethod
    def retry(func):
        def retry_func():
            max_retries = 4
            sleep_between_retries = 2

            for retries in range(max_retries):
                if retries:
                    sleep_between_retries *= 2
                    logger.info("Failure in sending logs - Trying again in {} seconds"
                                .format(sleep_between_retries))
                    time.sleep(sleep_between_retries)
                try:
                    res = func()
                    res.raise_for_status()
                except requests.exceptions.HTTPError as e:
                    status_code = res.status_code
                    if status_code == 400:
                        raise BadLogsException(e.reason)
                    elif status_code == 401:
                        raise UnauthorizedAccessException()
                    elif status_code == 404:
                        raise UnknownURL()
                    else:
                        logger.error("Unknown HTTP exception: {}".format(e))
                        continue
                except requests.exceptions.RequestException:
                    raise
                return res

            raise MaxRetriesException()

        return retry_func

    def _send_to_logzio(self):
        @LogzioShipper.retry
        def do_request():
            headers = {"Content-type": "application/json"}
            response = requests.post(self._logzio_url, data='\n'.join(self._logs), headers=headers)
            return response
        try:
            do_request()
            logger.info("Successfully sent bulk of {} logs to Logz.io!".format(len(self._logs)))
        except MaxRetriesException:
            logger.error('Retry limit reached. Failed to send log entry.')
            raise MaxRetriesException()
        except BadLogsException as e:
            logger.error("Got 400 code from Logz.io. This means that some of your logs are too big, "
                         "or badly formatted. response: {0}".format(e.message))
            raise BadLogsException()
        except UnauthorizedAccessException:
            logger.error("You are not authorized with Logz.io! Token OK? dropping logs...")
            raise UnauthorizedAccessException()
        except UnknownURL:
            logger.error("Please check your url...")
            raise UnknownURL()
        except requests.exceptions.RequestException as e:
            logger.error("Unexpected error while trying to send logs: {}".format(e))
            raise

