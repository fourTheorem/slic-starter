import { log } from 'slic-tools';

export function handleTransformer(event, context, callback) {
  /**
   * Prevent stalling before sending the event. Added after Lambda errored with:
   * "SonicBoom destroyed"
   * See https://stackoverflow.com/questions/73181929/aws-lambda-timeout-using-fastify-and-serverless-framework
   */
  context.callbackWaitsForEmptyEventLoop = true;

  log.debug({ event: JSON.stringify(event) }, 'Event');
  let success = 0; // Number of valid entries found
  let failure = 0; // Number of invalid entries found
  let dropped = 0; // Number of dropped entries

  /* Process the list of records and transform them */
  const output = event.records.map((record) => {
    const entry = Buffer.from(record.data, 'base64').toString('utf8');
    try {
      const message = JSON.parse(entry);
      if (message.dynamodb.NewImage) {
        const {
          listId: { S: listId },
          userId: { S: userId },
        } = message.dynamodb.NewImage;
        const csvRecord = `${listId},${userId}\n`;
        success += 1;
        return {
          recordId: record.recordId,
          result: 'Ok',
          data: Buffer.from(csvRecord, 'utf8').toString('base64'),
        };
      }
      dropped += 1;
      return {
        recordId: record.recordId,
        result: 'Dropped',
        data: record.data,
      };
    } catch (error) {
      log.error({ err: error, entry }, 'Failed to process record');
      failure += 1;
      return {
        recordId: record.recordId,
        result: 'ProcessingFailed',
        data: record.data,
      };
    }
  });

  log.info({ success, failure, dropped }, 'Processing completed');
  const result = { records: output };
  log.info(result);
  callback(undefined, result);
}
