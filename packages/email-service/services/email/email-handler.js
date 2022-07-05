import { middify, log } from 'slic-tools';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import AWSXRay from 'aws-xray-sdk-core';

const sesClient = AWSXRay.captureAWSv3Client(
  new SESv2Client({
    endpoint: process.env.SES_ENDPOINT_URL,
    region: process.env.SES_REGION,
  })
);

export async function innerHandler(event, ctx) {
  log.info({ event }, 'sendEmail');

  const { to, subject, body } = JSON.parse(event.Records[0].body);

  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Content: {
      Simple: {
        Body: {
          Text: {
            Charset: 'UTF-8', // eslint-disable-line unicorn/text-encoding-identifier-case
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8', // eslint-disable-line unicorn/text-encoding-identifier-case
          Data: subject,
        },
      },
    },
    FromEmailAddress: ctx.emailFromAddress,
  };

  const result = await sesClient.send(new SendEmailCommand(params));
  log.info({ result }, 'Sent email');
}

export const sendEmail = middify(innerHandler, {
  ssmParameters: {
    emailFromAddress: `/${process.env.SLIC_STAGE}/email-service/from-address`,
  },
});
