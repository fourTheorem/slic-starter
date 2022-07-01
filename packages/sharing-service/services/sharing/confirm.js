const { processEvent } = require('slic-tools/event-util');
const { middify } = require('slic-tools/middy-util');
const share = require('./share');

async function main(event, { codeSecret }) {
  const { pathParameters, userId } = processEvent(event); // TODO - Remove processEvent
  const { code } = pathParameters;

  await share.confirm({ code, userId }, codeSecret);

  return {
    statusCode: 204,
  };
}

module.exports = middify(
  { main },
  {
    ssmParameters: {
      codeSecret: `/${process.env.SLIC_STAGE}/sharing-service/code-secret`,
    },
    isHttpHandler: true,
  }
);
