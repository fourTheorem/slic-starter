import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/PageModel.js'

const page = new Page()

fixture(`Signup test`)
  .page('localhost:3000/signup')
  .beforeEach(() => waitForReact())

test('Signup Test', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click('#signup-button')
  await t.expect(page.emailInput.value).contains('email')
  await t.expect(page.passInput.value).contains('password')
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('localhost:3000/confirm-signup')
  const confirmationInput = Selector('#confirmationCode')
  await t.typeText(confirmationInput, '123456')
  await t.expect(confirmationInput.value).eql('123456')
  await t.click('#confirm-signup-btn')
  await t.expect(getLocation()).contains('/login')
})

test('Resend Confirmation Test', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click('#signup-button')
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/confirm-signup')
  await t.click(Selector('#resend-code-btn'))
  await t.expect(Selector('p').withText('Code successfully sent!').exists).ok()
})
