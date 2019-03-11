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
  await t.click(page.loginBtn)
  await t.click(Selector('#new-list-button'))
  const listNameInput = Selector('#name')
  await t.typeText(listNameInput, 'First List')
  await t.click('#new-list-button')
  await t.expect(listNameInput.value).eql('First List')
  await t.expect(Selector('h2').withText('First List').exists).ok()
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/list/')
})

test('Add item to list', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click(page.loginBtn)
  const getLocation = ClientFunction(() => document.location.href)
  await t.wait(3000)
  await t.expect(getLocation()).contains('localhost:3000')
  await t.click(Selector('a').nth(0))
  await t.expect(Selector('h2').withText('First List')).exists
  await t.typeText('#newEntryTitle', 'New Item 1', { replace: true })
  await t.pressKey('enter')
  await t.expect(Selector('span').withText('New Item 1')).exists
  await t.typeText('#newEntryTitle', 'New Item 2', { replace: true })
  await t.expect(Selector('span').withText('New Item 2')).exists
  await t.pressKey('enter')
  await t.typeText('#newEntryTitle', 'Another Entry', { replace: true })
  await t.expect(Selector('span').withText('Another Entry')).exists
  await t.pressKey('enter')
  await t.typeText('#newEntryTitle', 'Last Entry', { replace: true })
  await t.expect(Selector('span').withText('Last Entry')).exists
  await t.pressKey('enter')
})

test('Delete entry from a list', async t => {
  await t.typeText(page.emailInput, 'email')
  await t.typeText(page.passInput, 'password')
  await t.click(page.loginBtn)
  const getLocation = ClientFunction(() => document.location.href)
  await t.wait(3000)

  await t.expect(getLocation()).contains('localhost:3000')
  await t.click(Selector('a').nth(0))
  await t.expect(Selector('h2').withText('First List')).exists
  await t.click(Selector('button').nth(1))
  await t.expect(Selector('h6').withText('Delete Entry?')).exists

  const confirmBtn = Selector('#entry-confirmation-confirm-btn')
  const confirmListDeleteBtn = Selector('#list-confirmation-confirm-btn')
  await t.expect(confirmBtn.visible).ok()
  await t.click(confirmBtn)
  await t.click(Selector('button').nth(3))
  await t.click(confirmListDeleteBtn)
  await t.expect()
})
