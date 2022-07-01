const { middify } = require('slic-tools/middy-util');
const log = require('slic-tools/log');
const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');
const { captureAWSv3Client } = require('aws-xray-sdk-core');

const sesClient = captureAWSv3Client(
  new SESv2Client({
    endpoint: process.env.SES_ENDPOINT_URL,
    region: process.env.SES_REGION,
  })
);

async function sendEmail(message, context) {
  log.info({ message }, 'sendEmail');

  const { to, subject, body } = JSON.parse(message.Records[0].body);

  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Content: {
      Simple: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
    },
    FromEmailAddress: context.emailFromAddress,
  };

  const result = await sesClient.send(new SendEmailCommand(params));
  log.info({ result }, 'Sent email');
}

module.exports = middify(
  { sendEmail },
  {
    ssmParameters: {
      emailFromAddress: `/${process.env.SLIC_STAGE}/email-service/from-address`,
    },
  }
);
