import { ClientFunction, Role, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/config')
const { generateUser } = require('../lib/user')

const page = new Page()

const getLocation = ClientFunction(() => document.location.href)

const user = generateUser()

const rolePromise = config.getBaseUrl().then((baseUrl) => Role(
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
    await t.expect(Selector('#new-list-button', { timeout: 155000 }).exists).ok()
  },
  { preserveUrl: true }
))

fixture('Checklist test')

test('User can create a new List', async t => {
  const role = await rolePromise
  await t.useRole(role).click(Selector('#new-list-button', { timeout: 15000 }))

  const listNameInput = Selector('#name')
  await t
    .maximizeWindow()
    .typeText(listNameInput, 'First List', { timeout: 1000 })
    .typeText(Selector('#description'), 'List Description', { timeout: 1000 })
    .click('#save-btn', { timeout: 2000 })
  await t
    .click(Selector('a').withText('First List'), { timeout: 2000 })
    .click(Selector('#expansion-summary'))
  await t
    .expect(Selector('#list-name').withText('First List', { timeout: 2000 }).exists).ok()
  await t.expect(Selector('#list-description').withText('List Description').exists).ok()
  await t.expect(getLocation()).contains('/list/')
})

test('Can add entries to newly created list', async t => {
  const role = await rolePromise
  await t.useRole(role).click(Selector('a').withText('First List'))

  await t.typeText(Selector('#newEntryTitle'), 'New Item 1', { replace: true })
  await t.pressKey('enter')
  await t.expect(Selector('span').withText('New Item 1').exists).ok()

  await t.typeText('#newEntryTitle', 'New Item 2', { replace: true })
  await t.pressKey('enter')
  await t.expect(Selector('span').withText('New Item 2').exists).ok()

  await t.typeText('#newEntryTitle', 'Another Entry', { replace: true })
  await t.pressKey('enter')
  await t.expect(Selector('span').withText('Another Entry').exists).ok()

  await t.typeText('#newEntryTitle', 'Last Entry', { replace: true })
  await t.pressKey('enter')
  await t.expect(Selector('span').withText('Last Entry').exists).ok()
})

test('Can mark entries as completed', async t => {
  const role = await rolePromise
  await t.useRole(role)
  await t
    .click(Selector('a').withText('First List'))
    .expect(Selector('h4').withText('First List').exists).ok()

  const checkbox = Selector('input').withAttribute('name', 'checkbox-entry-0')
  await t.click(checkbox)
  await t.expect(checkbox.checked).ok()
})

test('Can update existing entries', async t => {
  const role = await rolePromise
  await t.useRole(role)
  await t.click(Selector('a').withText('First List'))
  await t.expect(Selector('h4').withText('First List').exists).ok()

  await t.click(Selector('button').withAttribute('name', 'New Item 1'))
  await t.expect(Selector('li').withText('Edit').exists).ok()

  await t.click(Selector('#edit-entry'))
  await t.typeText('#edit-entry', 'Updated Value', { replace: true })
  await t.click(Selector('#save-btn')).wait(1000)
  await t.expect(Selector('span').withText('Updated Value').exists).ok()
})

test('Can delete an entry from an existing list', async t => {
  const role = await rolePromise
  await t.useRole(role)

  await t.click(Selector('a').withText('First List'))
  await t.expect(Selector('h4').withText('First List').exists).ok()

  await t.click(Selector('button').withAttribute('name', 'Updated Value'))
  await t.expect(Selector('li').withText('Delete').exists).ok()
  await t.click(Selector('#delete-entry'))
  await t.expect(Selector('h2').withText('Delete Entry?').exists).ok()

  const confirmBtn = Selector('#entry-confirmation-confirm-btn')
  await t.click(confirmBtn)
  await t.expect(Selector('span').withText('New Item 1').exists).notOk()
})

test('User can update an already existing list', async t => {
  const role = await rolePromise
  const titleTextfield = Selector('#name')
  const descriptionTextField = Selector('#description')

  await t.useRole(role)
  await t.click(Selector('a').withText('First List'))
  await t.expect(Selector('h4').withText('First List').exists).ok()
  await t.click(Selector('#edit-list-btn'))
  await t.expect(titleTextfield.exists).ok()
  await t.pressKey('ctrl+a delete').expect(descriptionTextField.exists).ok()

  await t.typeText(titleTextfield, 'Updated List Title')
  await t.expect(titleTextfield.value).eql('Updated List Title')
  await t.click(descriptionTextField)
  await t.pressKey('ctrl+a delete')
  await t.typeText(descriptionTextField, 'Updated List Description')
  await t.expect(descriptionTextField.value).eql('Updated List Description')
  await t.click(Selector('#save-btn'))
  await t.expect(Selector('h4').withText('Updated List Title').exists).ok()
  await t.click(Selector('#expansion-summary'))
  await t.expect(Selector('#list-description').withText('Updated List Description').exists).ok()
})

test('Can remove a full list, including entries', async t => {
  const role = await rolePromise
  await t.useRole(role)
  await t.click(Selector('a').withText('Updated List Title'))
  await t.click(Selector('#edit-list-btn'))
  await t.click(Selector('#delete-list-btn'))

  const deleteListConfirmBtn = Selector('#list-confirmation-confirm-btn')

  await t.click(deleteListConfirmBtn)
  await t.expect(
    Selector('h6').withText(
      "You don't have any lists. Click the button to create one"
    ).exists
  ).ok()
})

test('Can log out from the current session', async t => {
  const role = await rolePromise
  await t
    .useRole(role)
    .click(Selector('#logout-btn', { timeout: 1000 }))
    .expect(getLocation())
    .contains('/login')
})
