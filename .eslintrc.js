module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
  },
  plugins: [
    'mocha',
    'async-await',
  ],
  globals: {
    APP_ROOT_DIR: true,
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  rules: {
    'func-names': 0,
    'import/no-dynamic-require': 0,
    'import/newline-after-import': 0,
    'no-shadow': 0,
    'no-underscore-dangle': 0,
    'max-len': 0,
  },
};
