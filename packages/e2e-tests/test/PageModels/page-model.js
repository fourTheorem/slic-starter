import { Selector } from 'testcafe';

export default class Page {
  constructor() {
    this.emailInput = Selector('#email');
    this.passInput = Selector('#password');
    this.loginBtn = Selector('#login-btn');
    this.resetPasswordLink = Selector('#forgot-password-link');
    this.resetPasswordBtn = Selector('#reset-password-btn');
  }
}
