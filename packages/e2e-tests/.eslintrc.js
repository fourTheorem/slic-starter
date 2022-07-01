module.exports = {
  plugins: ['testcafe'],
  extends: 'plugin:testcafe/recommended',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  root: true,
};
