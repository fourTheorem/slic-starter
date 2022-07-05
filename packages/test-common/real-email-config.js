const Mailosaur = require('mailosaur');
const RandomWords = require('random-words');

const { MAILOSAUR_SERVER_ID, MAILOSAUR_API_KEY } = process.env;

const client = new Mailosaur(MAILOSAUR_API_KEY);

function generateEmailAddress() {
  return `${RandomWords(3).join('-')}.${MAILOSAUR_SERVER_ID}@mailosaur.io`;
}

async function retrieveEmail(emailAddress, subject) {
  const message = await client.messages.get(
    MAILOSAUR_SERVER_ID,
    {
      sentTo: emailAddress,
      subject,
    },
    {
      timeout: 30_000,
    }
  );
  await client.messages.del(message.id);
  return message;
}

async function retrieveCode(emailAddress) {
  const email = await retrieveEmail(emailAddress);
  const emailBody = email.html.body;
  const splitBody = emailBody.split(' ');
  const confirmationCode = splitBody[splitBody.length - 1];
  return confirmationCode;
}

module.exports = {
  generateEmailAddress,
  retrieveCode,
  retrieveEmail,
};
