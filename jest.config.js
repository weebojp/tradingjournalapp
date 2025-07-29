module.exports = {
  // テスト環境の設定
  testEnvironment: 'node',
  
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // テストディレクトリの構造
  roots: ['<rootDir>/tests'],
  
  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/**/*.config.js'
  ],
  
  // カバレッジの最小閾値（TDDのため高めに設定）
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // カバレッジレポートの形式
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // TDD用の監視モード設定
  watchman: true,
  watchPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/coverage/'],
  
  // テスト実行時の詳細出力
  verbose: true,
  
  // 並列実行の設定
  maxWorkers: '50%',
  
  // テストタイムアウト
  testTimeout: 10000,
  
  // モジュールパスの設定
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  }
}; 