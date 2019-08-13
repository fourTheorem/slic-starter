'use strict'

const { middify } = require('slic-tools/middy-util')
const { getUser } = require('slic-tools/user-util')
const { sendEmail } = require('slic-tools/email-util')

async function handleNewChecklist(event) {
debugger
  const checklist = event.detail
  const { userId, name } = checklist

  const { email } = await getUser(userId)
  const message = {
    to: email,
    subject: 'Your SLIC List',
    body: `Congratulations! You created the list ${name}`
  }

debugger
  await sendEmail(message)
  return {}
}

module.exports = middify(
  { handleNewChecklist },
  {
    ssmParameters: {
      USER_SERVICE_URL: `/${process.env.SLIC_STAGE}/user-service/url`
    }
  }
)
