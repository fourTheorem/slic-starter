import { ClientFunction, Role, Selector } from 'testcafe'
import { retrieveEmail } from 'test-common/real-email-config'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/config')
const { generateUser } = require('../lib/user')

const page = new Page()

const users = [{}, {}]

const getLocation = ClientFunction(() => document.location.href)

for (const index in users) {
  const user = users[index]
  Object.assign(user, generateUser())
  user.rolePromise = config.getBaseUrl().then(baseUrl => Role(
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
}

fixture('Sharing test')

let invitationCodeLink
test('User can share a list after creation', async t => {
  const role = await users[0].rolePromise

  await t
    .useRole(role)
    .click(Selector('#new-list-button', { timeout: 5000 }))

  const listNameInput = Selector('#name')
  await t
    .typeText(listNameInput, 'List to Share', { timeout: 1000 })
    .typeText(Selector('#description'), 'List Description')
    .click('#save-btn', { timeout: 2000 })
    .click(Selector('a').withText('List to Share'))
    .click(Selector('#expansion-summary'))
    .expect(getLocation())
    .contains('/list/')
    .click(Selector('#share-list-btn'))
    .typeText(Selector('#email-textfield'), users[1].email)
    .click('#share-btn')
  await t.wait(15000)
  const content = await retrieveEmail(users[1].email, 'Invitation to join')
  invitationCodeLink = content.text.links[0].href
  await t.expect(invitationCodeLink).ok()
})

test('Second user can confirm and access the shared list', async t => {
  const baseUrl = await config.getBaseUrl()
  const role = await users[1].rolePromise
  await t
    .useRole(role)
    .navigateTo(invitationCodeLink)
    .expect(Selector('#accept', { timeout: 5000 }).exists).ok()
  await t
    .click('#accept')
    .expect(Selector('p', { timeout: 5000 }).withText('You now have access to').exists).ok()
  await t.wait(10000) // Await for list share action to settle
  await t
    .navigateTo(baseUrl)
    .expect(Selector('#new-list-button', { timeout: 5000 }).exists).ok()
  await t.expect(Selector('a').withText('List to Share').exists).ok()
})
