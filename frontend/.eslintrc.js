module.exports = {
  root: true,
  extends: ['standard', 'react-app'],
  plugins: [],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-underscore-dangle': 'off',
    semi: 'off'
  }
}
