module.exports = {
  extends: ['standard', 'react-app', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-underscore-dangle': 'off',
  },
};
