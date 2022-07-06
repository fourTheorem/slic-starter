import { Selector } from 'testcafe';
import { waitForReact } from 'testcafe-react-selectors';

import Page from './PageModels/page-model.js';
import * as config from '../lib/config.js';

const page = new Page();
const email = config.getEmail();

fixture('Login test');

test('Sign up before login', async (t) => {
  const baseUrl = await config.getBaseUrl();
  await t.navigateTo(baseUrl);
  await waitForReact();
  await t.click(Selector('#signup-link'));
  await t.typeText(page.emailInput, email);
  await t.typeText(page.passInput, 'Slic123@');

  await t.click(Selector('#signup-btn', { timeout: 1000 }));

  const code = await config.getCode(email);
  await t.typeText(Selector('#confirmation-code'), code);
  await t.click(Selector('#confirm-signup-btn'));
});

test('User can Log in after signing up', async (t) => {
  const baseUrl = await config.getBaseUrl();
  await t.navigateTo(baseUrl);
  await waitForReact();
  await t.typeText(page.emailInput, email);
  await t.typeText(page.passInput, 'Slic123@');

  await t.expect(page.emailInput.value).contains(email);
  await t.expect(page.passInput.value).contains('Slic123@');
  await t.click(page.loginBtn);

  const h6 = Selector('h6');
  await t
    .expect(
      h6.withText("You don't have any lists. Click the button to create one!")
        .exists
    )
    .ok();
  await t.expect(Selector('#new-list-button').exists).ok();
  await t.expect(Selector('#logout-btn').exists).ok();
});
