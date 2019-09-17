import { ClientFunction, Role, Selector } from 'testcafe'
import { retrieveEmail } from 'test-common/real-email-config'
import { waitForReact } from 'testcafe-react-selectors'
import Page from './PageModels/page-model'

const config = require('../lib/config')
const { generateUser } = require('../lib/user')

const page = new Page()
const baseUrl = config.getBaseURL()

console.log('Base URL', baseUrl)

const users = [{}, {}]

const getLocation = ClientFunction(() => document.location.href)

for (const index in users) {
  const user = users[index]
  Object.assign(user, generateUser())
  user.role = Role(
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
}

fixture('Login')
  .page(baseUrl)
  .beforeEach(() => waitForReact())

let invitationCodeLink
test('User can share a list after creation', async t => {
  await t
    .useRole(users[0].role)
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
    .expect(Selector('p').withText('List shared successfully!')).exists
  await t.wait(15000)
  const content = await retrieveEmail(users[1].email, 'Invitation to join')
  invitationCodeLink = content.text.links[0].href
  await t.expect(invitationCodeLink).ok()
})

test('Second user can confirm and access the shared list', async t => {
  await t
    .useRole(users[1].role)
    .navigateTo(invitationCodeLink)
    .expect(Selector('#accept', { timeout: 5000 })).exists
  await t
    .click('#accept')
    .expect(Selector('p', { timeout: 5000 }).withText('You now have access to'))
    .exists
  await t.wait(10000) // Await for list share action to settle
  await t
    .navigateTo(baseUrl)
    .expect(Selector('#new-list-button', { timeout: 5000 })).exists
  await t.expect(Selector('a').withText('List to Share')).exists
})
