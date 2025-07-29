# 🔴🟢🔵 テスト駆動開発（TDD）ガイド

## 概要

このプロジェクトでは**テスト駆動開発（TDD）を徹底**しています。すべての新機能は以下のRed-Green-Refactorサイクルに従って開発してください。

## 🔄 TDDサイクル

### 🔴 Red: 失敗するテストを書く
1. **最初に失敗するテストを書く**
2. テストが期待通りに失敗することを確認
3. 実装はまだ行わない

### 🟢 Green: テストを通す最小限の実装
1. **テストを通すための最小限のコードを書く**
2. 美しいコードでなくても良い
3. とにかくテストを通すことに集中

### 🔵 Refactor: コードを改善する
1. **機能を変更せずにコードを改善**
2. 重複を削除
3. 可読性を向上
4. 各ステップでテストが通ることを確認

## 🛠️ 開発環境のセットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. TDD監視モードの開始
```bash
# ファイル変更を監視してテストを自動実行
npm run test

# TDD専用監視モード（Red-Green-Refactorサイクルをサポート）
node scripts/tdd-watch.js
```

### 3. 新しいテストファイルの生成
```bash
# 対話式でテストファイルを生成
node scripts/test-generator.js
```

## 📝 テスト作成ガイドライン

### テストファイルの命名規則
- ユニットテスト: `tests/unit/[ModuleName].test.js`
- 統合テスト: `tests/integration/[FeatureName].test.js`
- E2Eテスト: `tests/e2e/[Scenario].test.js`

### テストの構造
```javascript
describe('モジュール名', () => {
  describe('機能グループ', () => {
    test('should [期待される動作]', () => {
      // Arrange: テスト環境の準備
      const input = { /* テストデータ */ };
      
      // Act: テスト対象の実行
      const result = targetFunction(input);
      
      // Assert: 結果の検証
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

### テストのベストプラクティス

#### ✅ 良いテスト
- **一つのテストは一つの事柄をテストする**
- **テスト名が期待される動作を明確に表現**
- **Arrange-Act-Assertパターンを使用**
- **テストデータは最小限で明確**

#### ❌ 避けるべきテスト
- 複数の機能を一つのテストでテスト
- あいまいなテスト名
- 実装の詳細に依存したテスト
- 他のテストに依存したテスト

## 📊 カバレッジ要件

### 最小カバレッジ閾値
- **Statements（文）: 90%以上**
- **Branches（分岐）: 90%以上**
- **Functions（関数）: 90%以上**
- **Lines（行）: 90%以上**

### カバレッジの確認
```bash
# カバレッジレポートの生成
npm run coverage

# カバレッジ閾値のチェック
node scripts/coverage-check.js

# HTMLレポートの表示
npm run coverage:report
```

## 🔧 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm test` | 監視モードでテスト実行 |
| `npm run test:ci` | CI用テスト実行（カバレッジ付き） |
| `npm run test:unit` | ユニットテストのみ実行 |
| `npm run test:integration` | 統合テストのみ実行 |
| `npm run test:e2e` | E2Eテストのみ実行 |
| `npm run coverage` | カバレッジレポート生成 |
| `npm run lint` | コード品質チェック |

## 🎯 TDD実践例

### ステップ1: 🔴 Red - 失敗するテストを書く
```javascript
// tests/unit/Calculator.test.js
describe('Calculator', () => {
  test('should add two numbers correctly', () => {
    const calculator = new Calculator();
    const result = calculator.add(2, 3);
    expect(result).toBe(5);
  });
});
```

**テスト実行結果**: ❌ 失敗（Calculatorクラスが存在しない）

### ステップ2: 🟢 Green - 最小限の実装
```javascript
// src/utils/Calculator.js
class Calculator {
  add(a, b) {
    return a + b; // 最小限の実装
  }
}

module.exports = Calculator;
```

**テスト実行結果**: ✅ 成功

### ステップ3: 🔵 Refactor - コードの改善
```javascript
// src/utils/Calculator.js
class Calculator {
  add(a, b) {
    // 入力検証を追加
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('引数は数値である必要があります');
    }
    return a + b;
  }
}

module.exports = Calculator;
```

**テスト実行結果**: ✅ 成功（既存テストは通る）

### ステップ4: 新しいテストケースを追加
```javascript
// tests/unit/Calculator.test.js
test('should throw error for invalid input', () => {
  const calculator = new Calculator();
  expect(() => {
    calculator.add('2', 3);
  }).toThrow('引数は数値である必要があります');
});
```

## 🚫 よくある間違い

### 1. テストを書く前に実装を始める
❌ **間違い**: 機能を実装してからテストを書く  
✅ **正解**: テストを書いてから実装する

### 2. 複雑なテストから始める
❌ **間違い**: 最初から複雑なシナリオをテスト  
✅ **正解**: 最も単純なケースから始める

### 3. 一度に多くの機能をテスト
❌ **間違い**: 一つのテストで複数の機能をテスト  
✅ **正解**: 一つのテストは一つの機能に集中

### 4. リファクタリングを怠る
❌ **間違い**: Greenフェーズで満足して終了  
✅ **正解**: 必ずRefactorフェーズでコードを改善

## 🔗 継続的インテグレーション

このプロジェクトでは、GitHub Actionsを使用してTDDプロセスを自動化しています：

1. **プルリクエスト時の自動テスト実行**
2. **カバレッジ閾値のチェック**
3. **コード品質の検証**
4. **カバレッジレポートの自動生成**

すべてのプルリクエストは以下の条件を満たす必要があります：
- ✅ すべてのテストが成功
- ✅ カバレッジ閾値（90%）をクリア
- ✅ ESLintチェックに合格

## 📚 参考資料

- [テスト駆動開発入門](https://www.amazon.co.jp/dp/4798124583)
- [Jest公式ドキュメント](https://jestjs.io/ja/)
- [TDD by Example - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

## 🤝 貢献ガイドライン

1. **すべての新機能はTDDで開発**
2. **プルリクエスト前にカバレッジ要件を満たす**
3. **テストが失敗する理由を明確にする**
4. **リファクタリング時もテストが通ることを確認**

---

**TDDは習慣です。毎日少しずつ実践して、より良いコードを書きましょう！** 🚀 