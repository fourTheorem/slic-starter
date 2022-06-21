import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/config.js')

const page = new Page()
const email = config.getEmail()

fixture('Reset password test')

test('Reset Password tests', async t => {
  const baseUrl = await config.getBaseUrl()
  await t.navigateTo(baseUrl)
  await waitForReact()
  await t.click(Selector('#signup-link'))
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')

  await t.click(Selector('#signup-btn', { timeout: 1000 }))

  const code = await config.getCode(email)
  await t.typeText(Selector('#confirmation-code'), code)
  await t.click(Selector('#confirm-signup-btn'))
})

test('User can Reset Password after signing up', async t => {
  const baseUrl = await config.getBaseUrl()
  await t.navigateTo(baseUrl)
  await waitForReact()
  await t.click(page.resetPasswordLink)
  await t.typeText(page.emailInput, email)

  await t.expect(page.emailInput.value).contains(email)
  await t.click(page.resetPasswordBtn)

  const confirmationCode = await config.getCode(email)

  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/confirm-forgot-password', { timeout: 5000 })
  const confirmationInput = Selector('#confirmation-code')

  await t.typeText(confirmationInput, confirmationCode)
  await t.typeText(Selector('#new-password'), 'Slic1234@')
  await t.click(Selector('#confirm-password-btn'))
  await t.expect(getLocation()).contains('/login')
})

test('User can Log in after reset password', async t => {
  const baseUrl = await config.getBaseUrl()
  await t.navigateTo(baseUrl)
  await waitForReact()
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic1234@')

  await t.click(page.loginBtn)

  const h6 = Selector('h6')
  await t.expect(h6.withText("You don't have any lists. Click the button to create one!").exists).ok()
  await t.expect(Selector('#new-list-button').exists).ok()
  await t.expect(Selector('#logout-btn').exists).ok()
})
