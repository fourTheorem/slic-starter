import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/config.js')

const page = new Page()
const baseUrl = config.getBaseURL()

const email = config.getEmail()
fixture(`Checklist test`)
  .page(baseUrl + '/login')
  .beforeEach(() => waitForReact())

test('Checklist Tests', async t => {
  await t.click(Selector('a'))

  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(Selector('#signup-btn'))

  const code = await config.getCode(email)
  await t.typeText(Selector('#confirmationCode'), code)
  await t.click(Selector('#confirm-signup-btn'))
})

test('User can create a new List', async t => {
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn)

  await t.click(Selector('#new-list-button', { timeout: 5000 }))

  const listNameInput = Selector('#name')
  await t.typeText(listNameInput, 'First List', { timeout: 1000 })
  await t.expect(listNameInput.value).eql('First List')

  await t.typeText(Selector('#description'), 'List Description')
  await t.expect(Selector('#description').value).eql('List Description')

  await t.click('#save-btn', { timeout: 2000 })
  await t.click(Selector('a').withText('First List'))
  await t.click(Selector('#expansion-summary'))
  await t.expect(Selector('#list-name').withText('First List')).exists
  await t.expect(Selector('#list-description').withText('List Description')).exists
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/list/')
})

test('Can add entries to newly created list', async t => {
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn, { timeout: 5000 })

  await t.click(Selector('a').withText('First List'))
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
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn, { timeout: 500 })
  await t.click(Selector('a').withText('First List'))
  await t.expect(Selector('h2').withText('First List')).exists

  const checkbox = Selector('input').withAttribute('name', 'checkbox-entry-0')
  await t.click(checkbox)
  await t.expect(checkbox.checked).ok()
})

test('Can update existing entries', async t => {
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn, { timeout: 500 })

  await t.click(Selector('a').withText('First List'))
  await t.expect(Selector('h2').withText('First List')).exists

  await t.click(Selector('Button').withAttribute('name', 'New Item 1'))
  await t.expect(Selector('Button').withText('Edit')).exists
  await t.click(Selector('#edit-entry'))

  await t.typeText('#edit-entry', 'Updated Value', { replace: true })
  await t.click(Selector('#save-btn'))

  await t.expect(Selector('span').withText('Updated Value')).exists
})

test('Can delete an entry from an existing list', async t => {
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn, { timeout: 500 })

  await t.click(Selector('a').withText('First List'))
  await t.expect(Selector('h2').withText('First List')).exists

  await t.click(Selector('Button').withAttribute('name', 'Updated Value'))
  await t.expect(Selector('Button').withText('Delete')).exists
  await t.click(Selector('#delete-entry'))
  await t.expect(Selector('h6').withText('Delete Entry?')).exists

  const confirmBtn = Selector('#entry-confirmation-confirm-btn')
  await t.click(confirmBtn)
  await t.expect(Selector('span').withText('New Item 1').exists).notOk
})

test('User can update an already existing list', async t => {
  const titleTextfield = Selector('#name')
  const descriptionTextField = Selector('#description')

  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn)

  await t.click(Selector('a').withText('First List'))
  await t.expect(Selector('h2').withText('First List')).exists
  await t.click(Selector('#edit-list-btn'))
  await t.expect(titleTextfield).exists
  await t.pressKey('ctrl+a delete')
  await t.expect(descriptionTextField).exists
  await t.typeText(titleTextfield, 'Updated List Title')
  await t.expect(titleTextfield.value).eql('Updated List Title')
  await t.click(descriptionTextField)
  await t.pressKey('ctrl+a delete')
  await t.typeText(descriptionTextField, 'Updated List Description')
  await t.expect(descriptionTextField.value).eql('Updated List Description')

  await t.click(Selector('#save-btn'))
  await t.expect(Selector('h2').withText('Updated List Title')).exists
  await t.expect(Selector('#description').withText('Updated List Description'))
    .exists
})

test('Can remove a full list, including entries', async t => {
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn, { timeout: 500 })

  await t.click(Selector('a').withText('Updated List Title'))
  await t.click(Selector('#edit-list-btn'))
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
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')
  await t.click(page.loginBtn)

  const baseUrl = ClientFunction(() => document.location.href)
  await t.click(Selector('#logout-btn', { timeout: 1000 }))
  await t.expect(baseUrl()).contains('/login')
})
