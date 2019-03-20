import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/PageModel.js'

const stageConfig = require('./stage-config')

const page = new Page()
const url = stageConfig.getURLFromStage()
const emailAdd = stageConfig.getEmailStore()

fixture(`Login test`)
  .page(url.concat('/login'))
  .beforeEach(() => waitForReact())

test('User can Log in after signing up', async t => {
  await t.typeText(page.emailInput, emailAdd[0])
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn)
  await t.expect(page.emailInput.value).contains(emailAdd[0])
  await t.expect(page.passInput.value).contains('Slic123@')

  const getLocation = ClientFunction(() => document.location.href)
  const h6 = Selector('h6')
  await t.expect(getLocation()).contains(url.concat('/Home'))
  await t.expect(
    h6.withText("You don't have any lists. Click the button to create one!")
  ).exists
  await t.expect(Selector('#new-list-button'))
  await t.expect(Selector('#logout-btn'))
})
