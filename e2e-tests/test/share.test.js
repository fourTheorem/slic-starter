const config = require('../lib/config')
import Page from './PageModels/page-model'
import { Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
const page = new Page()
const baseUrl = config.getBaseURL()
const email = config.getEmail()
fixture(`Sharing Tests`)
  .page(baseUrl + '/login')
  .beforeEach(() => waitForReact())

test('Sharing Tests', async t => {
  await t.click(Selector('a'))

  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(Selector('#signup-btn'))

  const code = await config.getCode(email)
  await t.typeText(Selector('#confirmationCode'), code)
  await t.click(Selector('#confirm-signup-btn'))
})
