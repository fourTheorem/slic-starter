module.exports = {
  extends: [
    'plugin:prettier/recommended',
    'eslint-config-airbnb-base',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'standard',
    'prettier',
  ],
  plugins: ['standard', 'eslint-comments', 'promise', 'unicorn'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      babelrc: false,
      configFile: false,
      presets: ['@babel/preset-env'],
    },
    sourceType: 'module',
    allowImportExportEverywhere: false,
    codeFrame: true,
  },
  ignorePatterns: [
    'cicd/*.yml', // Ignore YAML files as we uses partials with indentation for CICD
    '**/node_modules/',
    '**/dist/',
    '**/.nyc_output',
    '**/coverage',
    '**/.serverless',
    '**/.webpack',
    'frontend/build/static/',
    'cicd/**/*.js',
    '**/*.json',
  ],
  env: {
    node: true,
    browser: true,
  },
  rules: {
    indent: 'off', // Disable indent since prettier will do this
    'global-require': 'off', // disable no global require, managed through eslint-plugin-node
    'no-prototype-builtins': 'off', // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    'import/prefer-default-export': 'off', // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    'import/no-default-export': 'error',
    'import/no-extraneous-dependencies': 'off',
    'class-methods-use-this': 'off',
    'node/no-unpublished-import': 'off',
    'node/no-extraneous-import': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-array-reduce': ["error", {"allowSimpleOperations": true}],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-nested-ternary': 'off', // sometimes these are much clearer than if else blocks
    complexity: ['warn', { max: 10 }],
    // enforce kebab case filenames
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
      },
    ],
    'import/extensions': ['error', 'ignorePackages', {
      js: 'always',
    }],
  },
  overrides: [
    {
      files: ['**/*.test.*', 'test/**', 'util/**'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        complexity: 'off',
        'global-require': 'off',
        'no-await-in-loop': 'off',
        'no-console': 'off',
        'no-underscore-dangle': 'off',
        'no-shadow': 'off',
      },
    },
    {
      files: ['**/scripts/**'],
      rules: {
        'no-console': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
