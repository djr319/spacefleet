module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 'latest'
  },
  'rules': {
    'quotes': ['error', 'single']
  },
  'overrides': [
    {
      'files': ['views/scripts/*.js'],
      'rules': {
        'no-unused-vars': 'off',
        'no-undef': 'off'
      }
    }
  ]
}
