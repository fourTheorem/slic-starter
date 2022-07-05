import { getUser, log, middify, sendEmail } from 'slic-tools';

async function innerHandler(event, context) {
  const {
    detail: { userId, name },
  } = event;

  log.info({ context }, 'context');
  const { email } = await getUser(userId, context.userServiceUrl);
  const message = {
    to: email,
    subject: 'Your SLIC List',
    body: `Congratulations! You created the list ${name}`,
  };

  await sendEmail(message);
}

export const handler = middify(innerHandler, {
  ssmParameters: {
    userServiceUrl: `/${process.env.SLIC_STAGE}/user-service/url`,
  },
});
