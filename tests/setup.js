// テスト環境のグローバル設定
global.console = {
  ...console,
  // テスト中のログを制御
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// テストのタイムアウト設定
jest.setTimeout(10000);

// テストデータベースのセットアップ（必要に応じて）
beforeAll(async () => {
  // データベース接続やテストデータの初期化
});

// 各テスト後のクリーンアップ
afterEach(() => {
  // モックのリセット
  jest.clearAllMocks();
});

// テスト終了時のクリーンアップ
afterAll(async () => {
  // データベース接続の終了など
});

// カスタムマッチャーの設定（必要に応じて）
expect.extend({
  toBeValidTrade(received) {
    const pass = received && 
                 typeof received.symbol === 'string' &&
                 typeof received.quantity === 'number' &&
                 typeof received.price === 'number';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid trade`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid trade`,
        pass: false,
      };
    }
  },
}); 