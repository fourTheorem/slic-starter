import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/config.js')

const page = new Page()
const email = config.getEmail()

fixture('Reset password test')

test('Reset Password tests', async t => {
  // const baseUrl = await config.getBaseUrl()
  // await t.navigateTo(baseUrl)
  // await t.click(Selector('#forgot-password-link'))
  // await t.typeText(page.emailInput, email)
  // await t.click(Selector('#reset-password-btn'))

  // const confirmationCode = await config.getCode(email)

  // const getLocation = ClientFunction(() => document.location.href)
  // await t.expect(getLocation()).contains('/confirm-forgot-password', { timeout: 5000 })
  // const confirmationInput = Selector('#confirmation-code')
  // await t.typeText(page.passInput, 'Slic123@')

  // await t.typeText(confirmationInput, confirmationCode)
  // await t.expect(confirmationInput.value).eql(confirmationCode)
  // await t.click(Selector('#confirm-password-btn'))
  // await t.expect(getLocation()).contains('/login')

  const baseUrl = await config.getBaseUrl()
  await t.navigateTo(baseUrl)
  await waitForReact()
  await t.click(Selector('#signup-link'))
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')

  await t.click(Selector('#signup-btn', { timeout: 1000 }))

  const code = await config.getCode(email)
  await t.typeText(Selector('#confirmationCode'), code)
  await t.click(Selector('#confirm-signup-btn'))
})

test('User can Reset Password after signing up', async t => {
  const baseUrl = await config.getBaseUrl()
  await t.navigateTo(baseUrl)
  await waitForReact()
  await t.click(Selector('#forgot-password-link'))
  await t.typeText(page.emailInput, email)

  await t.expect(page.emailInput.value).contains(email)
  await t.click(page.resetPasswordLink)

  const confirmationCode = await config.getCode(email)

  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/confirm-forgot-password', { timeout: 5000 })
  const confirmationInput = Selector('#confirmation-code')
  await t.typeText(page.passInput, 'Slic123@')

  await t.typeText(confirmationInput, confirmationCode)
  await t.expect(confirmationInput.value).eql(confirmationCode)
  await t.click(Selector('#confirm-password-btn'))
  await t.expect(getLocation()).contains('/login')
})

// test('User can Reset Password after signing up', async t => {
//   const baseUrl = await config.getBaseUrl()
//   await t.navigateTo(baseUrl)
//   await waitForReact()
//   await t.typeText(page.emailInput, email)
//   await t.typeText(page.passInput, 'Slic123@')

//   await t.expect(page.emailInput.value).contains(email)
//   await t.expect(page.passInput.value).contains('Slic123@')
//   await t.click(page.resetPasswordLink)
// })
