import { ClientFunction, Role, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/config')
const { generateUser } = require('../lib/user')

const page = new Page()
const baseUrl = config.getBaseURL()

const getLocation = ClientFunction(() => document.location.href)

const user = generateUser()

const role = Role(
  `${baseUrl}/login`,
  async t => {
    await waitForReact()
    await t
      .click(Selector('a'))
      .typeText(page.emailInput, user.email)
      .typeText(page.passInput, user.password)
      .click('#signup-btn')

    const code = await config.getCode(user.email)
    await t
      .typeText(Selector('#confirmationCode'), code)
      .click(Selector('#confirm-signup-btn'))

    await t
      .typeText(page.emailInput, user.email)
      .typeText(page.passInput, user.password)
      .click(page.loginBtn)

    await t.wait(1000)
    await t.expect(Selector('#new-list-button', { timeout: 155000 })).exists
  },
  { preserveUrl: true }
)

fixture(`Checklist test`)

test('User can create a new List', async t => {
  await t.useRole(role).click(Selector('#new-list-button', { timeout: 15000 }))

  const listNameInput = Selector('#name')
  await t
    .maximizeWindow()
    .typeText(listNameInput, 'First List', { timeout: 1000 })
    .typeText(Selector('#description'), 'List Description', { timeout: 1000 })
    .click('#save-btn', { timeout: 2000 })
    .click(Selector('a').withText('First List'))
    .click(Selector('#expansion-summary'))
    .expect(Selector('#list-name').withText('First List')).exists
  await t.expect(Selector('#list-description').withText('List Description'))
    .exists
  await t.expect(getLocation()).contains('/list/')
})

test('Can add entries to newly created list', async t => {
  await t.useRole(role).click(Selector('a').withText('First List'))

  await t.typeText(Selector('#newEntryTitle'), 'New Item 1', { replace: true })
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
  await t.useRole(role)
  await t
    .click(Selector('a').withText('First List'))
    .expect(Selector('h2').withText('First List')).exists

  const checkbox = Selector('input').withAttribute('name', 'checkbox-entry-0')
  await t.click(checkbox)
  await t.expect(checkbox.checked).ok()
})

test('Can update existing entries', async t => {
  await t.useRole(role)
  await t.click(Selector('a').withText('First List'))
  await t.expect(Selector('h2').withText('First List')).exists

  await t.click(Selector('button').withAttribute('name', 'New Item 1'))
  await t.expect(Selector('button').withText('Edit')).exists

  await t.click(Selector('#edit-entry'))
  await t.typeText('#edit-entry', 'Updated Value', { replace: true })
  await t.click(Selector('#save-btn'))
  await t.expect(Selector('span').withText('Updated Value')).exists
})

test('Can delete an entry from an existing list', async t => {
  await t.useRole(role)

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

  await t.useRole(role)
  await t.click(Selector('a').withText('First List'))
  await t.expect(Selector('h2').withText('First List')).exists
  await t.click(Selector('#edit-list-btn'))
  await t.expect(titleTextfield).exists

  await t.pressKey('ctrl+a delete').expect(descriptionTextField).exists

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
  await t.useRole(role)
  await t.click(Selector('a').withText('Updated List Title'))
  await t.click(Selector('#edit-list-btn'))
  await t.click(Selector('#delete-list-btn'))

  const deleteListConfirmBtn = Selector('#list-confirmation-confirm-btn')

  await t.click(deleteListConfirmBtn)
  await t.expect(
    Selector('h6').withText(
      "You don't have any lists. Click the button to create one"
    )
  ).exists
})

test('Can log out from the current session', async t => {
  await t
    .useRole(role)
    .click(Selector('#logout-btn', { timeout: 1000 }))
    .expect(getLocation())
    .contains('/login')
})
