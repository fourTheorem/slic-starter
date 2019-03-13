import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/PageModel.js'

require('dotenv').config()

const Mailosaur = require('mailosaur')

const client = new Mailosaur(process.env.MAILOSAUR_API_KEY)
const page = new Page()
const sendToEmail = client.servers.generateEmailAddress(
  process.env.MAILOSAUR_SERVER_ID
)
let email = sendToEmail

fixture(`Signup test`)
  .page('dev.sliclists.com/signup')
  .beforeEach(() => waitForReact())

test.only('User can sign up for a new account', async t => {
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(Selector('button').withAttribute('tabindex', '0'))
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/confirm-signup')
  const confirmationInput = Selector('#confirmationCode')
  let body
  let code
  await client.messages
    .waitFor(process.env.MAILOSAUR_SERVER_ID, {
      sentTo: email
    })
    .then(email => {
      body = email.html.body
      const bodySplit = body.split(' ')
      code = bodySplit[bodySplit.length - 1]
    })
  await t.typeText(confirmationInput, code)
  await t.expect(confirmationInput.value).eql(code)
  await t.click('#confirm-signup-btn')
  await t.expect(getLocation()).contains('/login')
})

test('User can have a valid confirmation code resent', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click('#signup-button')
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/confirm-signup')
  await t.click(Selector('#resend-code-btn'))
  await t.expect(Selector('p').withText('Code successfully sent!').exists).ok()
})
