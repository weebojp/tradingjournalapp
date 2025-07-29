# 🔴🟢🔵 Trading Journal App - TDD徹底開発

[![TDD CI](https://github.com/your-username/trading-journal-app/workflows/TDD%20Continuous%20Integration/badge.svg)](https://github.com/your-username/trading-journal-app/actions)
[![Coverage](https://img.shields.io/badge/coverage-90%25+-brightgreen.svg)](./coverage/lcov-report/index.html)
[![Test Driven](https://img.shields.io/badge/development-test--driven-red.svg)](./docs/TDD_GUIDE.md)

**テスト駆動開発（TDD）を徹底したトレーディングジャーナルアプリケーション**

## 🎯 プロジェクトの特徴

- **🔴🟢🔵 100% TDD開発**: すべての機能はRed-Green-Refactorサイクルで開発
- **📊 高カバレッジ**: 90%以上のテストカバレッジを維持
- **🤖 自動化されたCI/CD**: GitHub Actionsでテスト・品質チェックを自動実行
- **📝 包括的テスト**: ユニット・統合・E2Eテストをすべて実装

## 🚀 クイックスタート

### 1. プロジェクトのセットアップ
```bash
# リポジトリをクローン
git clone https://github.com/your-username/trading-journal-app.git
cd trading-journal-app

# 依存関係をインストール
npm install

# TDD監視モードを開始
npm run tdd:watch
```

### 2. 新機能の開発（TDD）
```bash
# 1. 新しいテストファイルを生成
npm run tdd:generate

# 2. 🔴 Red: 失敗するテストを書く
# 3. 🟢 Green: 最小限の実装でテストを通す
# 4. 🔵 Refactor: コードを改善する
```

### 3. テストとカバレッジの確認
```bash
# すべてのテストを実行
npm test

# カバレッジレポートを生成
npm run coverage

# カバレッジ閾値をチェック
npm run coverage:check
```

## 📂 プロジェクト構造

```
trading-journal-app/
├── src/                    # アプリケーションコード
│   ├── controllers/        # APIコントローラー
│   ├── models/            # データモデル
│   ├── services/          # ビジネスロジック
│   ├── utils/             # ユーティリティ関数
│   └── app.js             # Expressアプリケーション
├── tests/                 # テストファイル
│   ├── unit/              # ユニットテスト
│   ├── integration/       # 統合テスト
│   ├── e2e/               # E2Eテスト
│   └── setup.js           # テストセットアップ
├── scripts/               # 開発支援スクリプト
│   ├── tdd-watch.js       # TDD監視モード
│   ├── test-generator.js  # テストファイル自動生成
│   └── coverage-check.js  # カバレッジチェック
├── docs/                  # ドキュメント
│   └── TDD_GUIDE.md       # TDD開発ガイド
└── .github/workflows/     # CI/CD設定
    └── tdd-ci.yml         # TDDワークフロー
```

## 🔧 利用可能なコマンド

### テスト関連
| コマンド | 説明 |
|---------|------|
| `npm test` | 監視モードでテスト実行 |
| `npm run test:ci` | CI用テスト実行（カバレッジ付き） |
| `npm run test:unit` | ユニットテストのみ実行 |
| `npm run test:integration` | 統合テストのみ実行 |
| `npm run test:e2e` | E2Eテストのみ実行 |

### TDD支援ツール
| コマンド | 説明 |
|---------|------|
| `npm run tdd:watch` | TDD専用監視モード |
| `npm run tdd:generate` | 新しいテストファイル生成 |
| `npm run coverage:check` | カバレッジ閾値チェック |
| `npm run coverage:report` | HTMLカバレッジレポート表示 |

### 開発・品質管理
| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run lint` | ESLintでコード品質チェック |
| `npm run lint:fix` | ESLintで自動修正 |

## 📊 品質メトリクス

### テストカバレッジ要件
- **Statements（文）**: 90%以上
- **Branches（分岐）**: 90%以上
- **Functions（関数）**: 90%以上
- **Lines（行）**: 90%以上

### CI/CDでの自動チェック
- ✅ すべてのテストが成功
- ✅ カバレッジ閾値をクリア
- ✅ ESLintチェックに合格
- ✅ 依存関係の脆弱性チェック

## 🔄 TDD開発サイクル

このプロジェクトでは以下のTDDサイクルを厳格に守ります：

### 🔴 Red フェーズ
1. **失敗するテストを書く**
2. テストが期待通りに失敗することを確認
3. 実装は行わない

### 🟢 Green フェーズ
1. **テストを通す最小限のコードを書く**
2. 美しいコードでなくても良い
3. とにかくテストを通すことに集中

### 🔵 Refactor フェーズ
1. **機能を変更せずにコードを改善**
2. 重複を削除
3. 可読性を向上
4. 各ステップでテストが通ることを確認

## 📚 ドキュメント

- [TDD開発ガイド](./docs/TDD_GUIDE.md) - 詳細なTDD実践方法
- [API仕様書](./docs/API.md) - RESTful API仕様
- [アーキテクチャ](./docs/ARCHITECTURE.md) - システム設計
- [貢献ガイド](./docs/CONTRIBUTING.md) - 開発への参加方法

## 🤝 開発への参加

このプロジェクトへの貢献は大歓迎です！以下の原則に従ってください：

1. **すべての新機能はTDDで開発**
2. **プルリクエスト前にカバレッジ要件を満たす**
3. **テストが失敗する理由を明確にする**
4. **リファクタリング時もテストが通ることを確認**

### 開発フロー
```bash
# 1. フィーチャーブランチを作成
git checkout -b feature/new-feature

# 2. TDD監視モードを開始
npm run tdd:watch

# 3. Red-Green-Refactorサイクルで開発
npm run tdd:generate  # テストファイル生成

# 4. 品質チェック
npm run lint
npm run coverage:check

# 5. プルリクエストを作成
git push origin feature/new-feature
```

## 🛠️ 技術スタック

- **Runtime**: Node.js
- **Framework**: Express.js
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint
- **CI/CD**: GitHub Actions
- **Coverage**: Jest Coverage + Codecov

## 📈 開発状況

- 🔴 **Red**: ![Red](https://img.shields.io/badge/failing-tests-red.svg)
- 🟢 **Green**: ![Green](https://img.shields.io/badge/passing-tests-green.svg)
- 🔵 **Refactor**: ![Refactor](https://img.shields.io/badge/clean-code-blue.svg)

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

---

**🔴🟢🔵 TDDで品質の高いコードを一緒に作りましょう！** 