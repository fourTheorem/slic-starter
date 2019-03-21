import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/url-config.js')

const page = new Page()
const baseUrl = config.getBaseURL()
const emailAdd = config.getEmailStore()

config.getEmail() //Only call this function for first test to create new test user

fixture(`Checklist test`)
  .page(baseUrl + '/login')
  .beforeEach(() => waitForReact())

test('User can create a new List', async t => {
  await t.click(Selector('a'))

  await t.typeText(page.emailInput, emailAdd[0])
  await t.typeText(page.passInput, 'Slic123@')

  await t.click(Selector('#signup-btn', { timeout: 1000 }))

  const code = await config.getCode(emailAdd[0])

  await t.typeText(Selector('#confirmationCode'), code)
  await t.click(Selector('#confirm-signup-btn'))

  await t.typeText(page.emailInput, emailAdd[0])
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn, { timeout: 1000 })
  await t.click(Selector('#new-list-button'))

  const listNameInput = Selector('#name')
  await t.typeText(listNameInput, 'First List')
  await t.expect(listNameInput.value).eql('First List')
  await t.click('#new-list-button')
  await t.expect(Selector('h2').withText('First List').exists).ok()
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/list/')
})

test('Can add entries to newly created list', async t => {
  await t.typeText(page.emailInput, emailAdd[0])
  await t.typeText(page.passInput, 'Slic123@')
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

test('Can mark Entries as Completed', async t => {
  await t.typeText(page.emailInput, emailAdd[0])
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn)
  await t.click(Selector('a').withAttribute('tabindex', '0'))
  await t.expect(Selector('h2').withText('First List')).exists

  const checkbox = Selector('input').withAttribute('name', 'checkbox-entry-0')
  await t.click(checkbox)
  await t.expect(checkbox.checked).ok()
})

test('Can delete an entry from an existing list', async t => {
  await t.typeText(page.emailInput, emailAdd[0])
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn)

  await t.click(Selector('a').withAttribute('tabindex', '0', { timeout: 1000 }))
  await t.expect(Selector('h2').withText('First List')).exists
  const deleteEntryBtn = Selector('button').withAttribute(
    'name',
    'delete-entry-btn-0'
  )
  await t.click(deleteEntryBtn)
  await t.expect(deleteEntryBtn.exists).notOk
  await await t.expect(Selector('h6').withText('Delete Entry?')).exists

  const confirmBtn = Selector('#entry-confirmation-confirm-btn')
  await t.click(confirmBtn)
  await t.expect(Selector('span').withText('New Item 1').exists).notOk
})

test('Can remove a full list, including entries', async t => {
  await t.typeText(page.emailInput, emailAdd[0])
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn)

  await t.click(Selector('a').withAttribute('tabindex', '0', { timeout: 1000 }))
  await t.click(Selector('#delete-list-btn'))
  const deleteListConfirmBtn = Selector('#list-confirmation-confirm-btn')

  await t.click(deleteListConfirmBtn, { timeout: 1000 })
  await t.expect(
    Selector('h6').withText(
      "You don't have any lists. Click the button to create one"
    )
  ).exists
})

test('Can Logout from the current session', async t => {
  await t.typeText(page.emailInput, emailAdd[0])
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn)

  const baseUrl = ClientFunction(() => document.location.href)
  await t.click(Selector('#logout-btn', { timeout: 1000 }))
  await t.expect(baseUrl()).contains('/login')
})
