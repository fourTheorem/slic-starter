import { Selector } from 'testcafe';

// eslint-disable-next-line import/no-default-export
export default class Page {
  constructor() {
    this.emailInput = Selector('#email');
    this.passInput = Selector('#password');
    this.loginBtn = Selector('#login-btn');
    this.resetPasswordLink = Selector('#forgot-password-link');
    this.resetPasswordBtn = Selector('#reset-password-btn');
  }
}
