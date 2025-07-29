module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended'
  ],
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // TDD開発に適したルール設定
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': 'warn',
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // テスト固有のルール
    'jest/no-disabled-tests': 'error',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'jest/expect-expect': 'error'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      rules: {
        // テストファイルでのコンソール出力を許可
        'no-console': 'off'
      }
    }
  ]
}; 