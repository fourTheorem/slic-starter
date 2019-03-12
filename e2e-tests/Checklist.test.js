import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/PageModel.js'

const page = new Page()

fixture(`Checklist test`)
  .page('localhost:3000/login')
  .beforeEach(() => waitForReact())

test('Add List Test', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click(page.loginBtn, { timeout: 3000 })

  await t.click(Selector('#new-list-button'))
  const listNameInput = Selector('#name')
  await t.typeText(listNameInput, 'First List')
  await t.click('#new-list-button')
  await t.expect(listNameInput.value).eql('First List')
  await t.expect(Selector('h2').withText('First List').exists).ok()
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/list/')
})

test('Add entry to list', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click(page.loginBtn)

  await t.click(Selector('a').withAttribute('tabindex', '0'))
  await t.expect(Selector('h2').withText('First List')).exists
  await t.typeText('#newEntryTitle', 'New Item 1', { replace: true })
  await t.pressKey('enter')
  await t.expect(Selector('span').withText('New Item 1')).exists

  await t.typeText('#newEntryTitle', 'New Item 2', { replace: true })
  await t.pressKey('enter')
  await t.expect(Selector('span').withText('New Item 2')).exists

  await t.typeText('#newEntryTitle', 'Another Entry', { replace: true })
  await t.pressKey('enter')
  await t.expect(Selector('span').withText('Another Entry')).exists

  await t.typeText('#newEntryTitle', 'Last Entry', { replace: true })
  await t.pressKey('enter')
  await t.expect(Selector('span').withText('Last Entry')).exists
})

test('Change Entry Value', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click(page.loginBtn)
  await t.click(Selector('a').withAttribute('tabindex', '0'))
  await t.expect(Selector('h2').withText('First List')).exists

  const checkbox = Selector('input').nth(0)
  await t.click(checkbox)
  await t.expect(checkbox.checked).ok()
})

test('Delete entry from a list', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click(page.loginBtn)

  await t.click(Selector('a').withAttribute('tabindex', '0', { timeout: 3000 }))
  await t.expect(Selector('h2').withText('First List')).exists
  await t.click(Selector('button').nth(2))
  await await t.expect(Selector('h6').withText('Delete Entry?')).exists

  const confirmBtn = Selector('#entry-confirmation-confirm-btn')
  await t.click(confirmBtn)
  await t.expect(Selector('span').withText('Another Entry')).notOk
})

test('Delete a list', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click(page.loginBtn)

  await t.click(Selector('a').withAttribute('tabindex', '0', { timeout: 3000 }))
  await t.click(Selector('#delete-list-btn'))
  const deleteListConfirmBtn = Selector('#list-confirmation-confirm-btn')

  await t.click(deleteListConfirmBtn, { timeout: 3000 })
  await t.expect(
    Selector('h6').withText(
      "You don't have any lists. Click the button to create one"
    )
  ).exists
})

test('Logout from current session', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click(page.loginBtn)

  const url = ClientFunction(() => document.location.href)
  await t.click(Selector('#logout-btn', { timeout: 3000 }))
  await t.expect(url()).contains('/login')
})
