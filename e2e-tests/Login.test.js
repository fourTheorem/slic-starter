import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/PageModel.js'

const page = new Page()

fixture(`Login test`)
  .page('localhost:3000/login')
  .beforeEach(() => waitForReact())

test('User can Log in after signing up', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click(page.loginBtn)
  await t.expect(page.emailInput.value).contains('email')
  await t.expect(page.passInput.value).contains('password')
})
