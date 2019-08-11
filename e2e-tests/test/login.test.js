import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/config.js')

const page = new Page()
const baseUrl = config.getBaseURL()
const email = config.getEmail()

fixture(`Login test`)
  .page(baseUrl + '/login')
  .beforeEach(() => waitForReact())
test('Login tests', async t => {
  await t.click(Selector('a'))
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')

  await t.click(Selector('#signup-btn', { timeout: 1000 }))

  const code = await config.getCode(email)
  await t.typeText(Selector('#confirmationCode'), code)
  await t.click(Selector('#confirm-signup-btn'))
})

test('User can Log in after signing up', async t => {
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')

  await t.expect(page.emailInput.value).contains(email)
  await t.expect(page.passInput.value).contains('Slic123@')
  await t.click(page.loginBtn)

  const getLocation = ClientFunction(() => document.location.href)
  const h6 = Selector('h6')
  await t.expect(
    h6.withText("You don't have any lists. Click the button to create one!")
  ).exists
  await t.expect(Selector('#new-list-button')).exists
  await t.expect(Selector('#logout-btn')).exists
})
