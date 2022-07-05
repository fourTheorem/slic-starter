import { SSMClient, PutParameterCommand } from '@aws-sdk/client-ssm';
import fs from 'node:fs/promises';

const jsonFile = process.argv[2];
if (!jsonFile) {
  throw new Error(`Usage: ${process.argv[1]} JSON_FILE`);
}

const inputs = JSON.parse(await fs.readFile(jsonFile));

const ssmClient = new SSMClient({});

const result = await Promise.all(
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
      .catch((error) => `${name} FAILED with ${error}`);
  })
);
console.log(result.join('\n'));
