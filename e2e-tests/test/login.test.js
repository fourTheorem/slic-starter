import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/url-config.js')

const page = new Page()
const baseUrl = config.getBaseURL()
const emailAdd = config.getEmailStore()

fixture(`Login test`)
  .page(baseUrl + '/login')
  .beforeEach(() => waitForReact())

test('User can Log in after signing up', async t => {
  await t.typeText(page.emailInput, emailAdd[0])
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn)

  await t.expect(page.emailInput.value).contains(emailAdd[0])
  await t.expect(page.passInput.value).contains('Slic123@')

  const getLocation = ClientFunction(() => document.location.href)
  const h6 = Selector('h6')
  await t.expect(getLocation()).contains(baseUrl + '/Home')
  await t.expect(
    h6.withText("You don't have any lists. Click the button to create one!")
  ).exists
  await t.expect(Selector('#new-list-button')).exists
  await t.expect(Selector('#logout-btn')).exists
})
