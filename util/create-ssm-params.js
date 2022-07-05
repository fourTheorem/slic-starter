import { SSMClient, PutParameterCommand } from '@aws-sdk/client-ssm';
import fs from 'node:fs/promises';

const jsonFile = process.argv[2];
if (!jsonFile) {
  console.error(`Usage: ${process.argv[1]} JSON_FILE`);
  process.exit(1);
}

const inputs = JSON.parse(await fs.readFile(jsonFile));

const ssmClient = new SSMClient({});

Promise.all(
  inputs.map(({ name, type, value }) => {
    console.log(`Creating ${name}`);

    return ssmClient
      .send(
        new PutParameterCommand({
          Name: name,
          Type: type,
          Value: value,
          Overwrite: true,
        })
      )
      .then(() => name)
      .catch((err) => `${name} FAILED with ${err}`);
  })
)
  .then((result) => console.log(result.join('\n')))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
