import { log } from 'slic-tools';

log.info('Loading function');

/* Stock Ticker format parser */
const parser =
  /^{"ticker_symbol":"[a-z]+","sector":"[a-z]+","change":[\d.-]+,"price":[\d.-]+}/i;
// "ticker_symbol":"NGC","sector":"HEALTHCARE","change":-0.08,"price":4.73

export async function handleTransformer(event, context, callback) {
  // eslint-disable-next-line no-unused-vars
  let successs = 0; // Number of valid entries found
  // eslint-disable-next-line no-unused-vars
  let failure = 0; // Number of invalid entries found
  // eslint-disable-next-line no-unused-vars
  let dropped = 0; // Number of dropped entries

  /* Process the list of records and transform them */
  const output = event.records.map((record) => {
    const entry = Buffer.from(record.data, 'base64').toString('utf8');
    log.info(entry, 'Entry:');
    const match = parser.exec(entry);
    if (match) {
      const parsedMatch = JSON.parse(match);
      const milliseconds = Date.now();
      const parseMatchString = JSON.stringify(parsedMatch);
      log.info(parseMatchString, 'Data logged');
      /* Add timestamp and convert to CSV */
      const result =
        `${milliseconds},${parsedMatch.ticker_symbol},${parsedMatch.sector},${parsedMatch.change},${parsedMatch.price}` +
        '\n';
      const payload = Buffer.from(result, 'utf8').toString('base64');
      if (parsedMatch.sector !== 'RETAIL') {
        /* Dropped event, notify and leave the record intact */
        log.info(`Dropped event :${record.data}`);
        dropped = +1;
        return {
          recordId: record.recordId,
          result: 'Dropped',
          data: record.data,
        };
      }
      /* Transformed event */
      log.info(`Successfull event :${payload}`);
      successs = +1;
      return {
        recordId: record.recordId,
        result: 'Ok',
        data: payload,
      };
    }
    /* Failed event, notify the error and leave the record intact */
    log.info(`Failed event :${record.data}`);
    failure = +1;
    return {
      recordId: record.recordId,
      result: 'ProcessingFailed',
      data: record.data,
    };
  });
  log.info(`Processing completed.  Successful records ${output.length}.`);
  callback(undefined, { records: output });
}

// export async function handleTransformer(event) {
//   let success = 0; // Number of valid entries found
//   let failure = 0; // Number of invalid entries found
//   let dropped = 0; // Number of dropped entries

//   /* Process the list of records and transform them */
//   const output = event.records.map((record) => {
//     // Extract JSON record from base64 data
//     const buffer = Buffer.from(record.data, 'base64').toString();
//     const jsonRecord = JSON.parse(buffer);
//     const jsonRecordString = JSON.stringify(jsonRecord);
//     log.info({ jsonRecordString }, 'Data logged');

//     // Add calculated field
//     jsonRecord.output =
//       ((jsonRecord.cadence + 35) * (jsonRecord.resistance + 65)) / 100;

//     // Convert back to base64 + add a newline
//     const dataBuffer = Buffer.from(
//       `${JSON.stringify(jsonRecord)}\n`,
//       'utf8'
//     ).toString('base64');

//     return {
//       recordId: record.recordId,
//       result: 'Ok',
//       data: dataBuffer,
//     };
//   });

//   log.info(`{ recordsTotal: ${output.length} }`);
//   return { records: output };
// }
