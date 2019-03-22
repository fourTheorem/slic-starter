import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/config')

const page = new Page()

const baseUrl = config.getBaseURL()
const email = config.getEmail()

fixture(`Signup test`)
  .page(baseUrl + '/signup') //use env variables
  .beforeEach(() => waitForReact())

test('User can sign up for a new account', async t => {
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(Selector('#signup-btn'))

  const confirmationCode = await config.getCode(email)

  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/confirm-signup', { timeout: 5000 })
  const confirmationInput = Selector('#confirmationCode')

  await t.typeText(confirmationInput, confirmationCode)
  await t.expect(confirmationInput.value).eql(confirmationCode)
  await t.click(Selector('#confirm-signup-btn'))
  await t.expect(getLocation()).contains('/login')
})

test('User can have a valid confirmation code resent', async t => {
  const email = config.getEmail()
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click('#signup-btn')
  await config.getCode(email)
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/confirm-signup')
  await t.click(Selector('#resend-code-btn'))
  await t.expect(Selector('p').withText('Code successfully sent!').exists).ok()
})
