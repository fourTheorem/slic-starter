const { getUser } = require('slic-tools/user-util');
const { sendEmail } = require('slic-tools/email-util');
const { dispatchEvent } = require('slic-tools/event-dispatcher');
const log = require('slic-tools/log');

const invitation = require('../../lib/invitation');

async function create(
  { email, listId, listName, userId },
  codeSecret,
  userServiceUrl,
  frontendUrl
) {
  const { email: sharerEmail } = await getUser(userId, userServiceUrl);
  log.info({ email, userId, listId });

  const { createCode } = invitation(codeSecret);
  const code = createCode({ listId, listName, userId, email });
  log.info({ code });

  const baseLink = `${frontendUrl}/invitation/`;
  const fullLink = baseLink + code;

  const message = {
    to: email,
    subject: `Invitation to join ${listName}`,
    body: `${sharerEmail} has invited you to join ${listName} on SLIC Lists
To accept this invitation, click on the following link.
${fullLink}

Many thanks,
SLIC Lists
`,
  };
  log.debug({ message }, 'Dispatching email');
  await sendEmail(message);
}

async function confirm({ code, userId }, codeSecret) {
  const { parseCode } = invitation(codeSecret);
  let parsedCode;
  try {
    parsedCode = parseCode(code);
  } catch (err) {
    const error = new Error('Invalid code');
    error.statusCode = 400;
    throw error;
  }
  await dispatchEvent('COLLABORATOR_ACCEPTED_EVENT', {
    listId: parsedCode.listId,
    sharedListOwner: parsedCode.userId,
    userId,
  });
}

module.exports = {
  create,
  confirm,
};
