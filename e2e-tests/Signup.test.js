import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/PageModel.js'

const stageConfig = require('./stage-config')

const page = new Page()

const url = stageConfig.getURLFromStage()
const email = stageConfig.getEmail()

fixture(`Signup test`)
  .page(url.concat('/signup')) //use env variables
  .beforeEach(() => waitForReact())

test('User can sign up for a new account', async t => {
  console.log(email)
  await t.debug()
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(Selector('button').withAttribute('tabindex', '0'))

  const confirmationCode = await stageConfig.getCode(email)

  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/confirm-signup', { timeout: 5000 })
  const confirmationInput = Selector('#confirmationCode')

  await t.typeText(confirmationInput, confirmationCode)
  console.log(confirmationCode)
  await t.expect(confirmationInput.value).eql(confirmationCode)
  await t.click(Selector('#confirm-signup-btn'))
  await t.expect(getLocation()).contains('/login')
})

test.only('User can have a valid confirmation code resent', async t => {
  const emailAdd = stageConfig.getEmail()
  await t.typeText(page.emailInput, emailAdd)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click('#signup-btn')
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/confirm-signup')
  await t.click(Selector('#resend-code-btn'))
  await t.expect(Selector('p').withText('Code successfully sent!').exists).ok()
})
