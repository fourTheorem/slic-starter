import { ClientFunction, Selector } from 'testcafe'
import { retrieveEmail } from 'test-common/real-email-config'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/config')

let link
const page = new Page()
const email = config.getEmail()
const baseUrl = config.getBaseURL()

fixture(`Login`)
  .page(baseUrl + '/login')
  .beforeEach(() => waitForReact())

test('Share Tests', async t => {
  await t.click(Selector('a'))
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')

  await t.click(Selector('#signup-btn', { timeout: 1000 }))

  const code = await config.getCode(email)
  await t.typeText(Selector('#confirmationCode'), code)
  await t.click(Selector('#confirm-signup-btn'))
})

test('User can share a list after creation', async t => {
  await t.typeText(page.emailInput, email)
  await t.typeText(page.passInput, 'Slic123@')

  await t.expect(page.emailInput.value).contains(email)
  await t.expect(page.passInput.value).contains('Slic123@')
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
  await t.expect(Selector('#list-description').withText('List Description'))
    .exists
  const getLocation = ClientFunction(() => document.location.href)
  await t.expect(getLocation()).contains('/list/')

  await t.click(Selector('#share-list-btn'))
  await t.typeText(Selector('#email-textfield'), email)
  await t.expect(Selector('#email-textfield').value).eql(email)
  await t.click('#share-btn')

  await t.expect(Selector('p').withText('List shared successfully!')).exists
  await t.wait(6500)

  const content = await retrieveEmail(email)
  link = content.text.links[0]

  await t.navigateTo(link.href)
  await t.click('#accept')
  await t.expect(Selector('p').withText('You now have access to')).exists
})
