#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class TestGenerator {
  async generateTest() {
    console.log('🧪 TDDテストファイル生成ツール\n');
    
    const moduleName = await this.askQuestion('モジュール名を入力してください: ');
    const moduleType = await this.askQuestion('モジュールタイプ (class/function/api): ');
    const description = await this.askQuestion('機能の説明: ');

    const testTemplate = this.getTestTemplate(moduleName, moduleType, description);
    const testFilePath = `tests/unit/${moduleName}.test.js`;

    // ディレクトリが存在しない場合は作成
    const testDir = path.dirname(testFilePath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // テストファイルを作成
    fs.writeFileSync(testFilePath, testTemplate);
    
    console.log(`\n✅ テストファイルが生成されました: ${testFilePath}`);
    console.log('\n🔴 Red: まず失敗するテストを確認してください');
    console.log('🟢 Green: 実装してテストを通してください');
    console.log('🔵 Refactor: コードを改善してください\n');

    rl.close();
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  getTestTemplate(moduleName, moduleType, description) {
    const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    
    switch (moduleType.toLowerCase()) {
      case 'class':
        return this.getClassTestTemplate(moduleName, capitalizedName, description);
      case 'function':
        return this.getFunctionTestTemplate(moduleName, description);
      case 'api':
        return this.getApiTestTemplate(moduleName, description);
      default:
        return this.getDefaultTestTemplate(moduleName, description);
    }
  }

  getClassTestTemplate(moduleName, capitalizedName, description) {
    return `// ${description}のテスト
const ${capitalizedName} = require('../../src/utils/${capitalizedName}');

describe('${capitalizedName}', () => {
  let ${moduleName};

  beforeEach(() => {
    ${moduleName} = new ${capitalizedName}();
  });

  describe('constructor', () => {
    test('should create an instance', () => {
      expect(${moduleName}).toBeInstanceOf(${capitalizedName});
    });
  });

  describe('main functionality', () => {
    test('should implement main feature', () => {
      // Red: 失敗するテストを最初に書く
      // TODO: 実際のテストケースを実装してください
      expect(true).toBe(false); // 意図的に失敗させる
    });

    test('should handle edge cases', () => {
      // TODO: エッジケースのテストを実装してください
      expect(true).toBe(false); // 意図的に失敗させる
    });

    test('should validate input', () => {
      // TODO: 入力検証のテストを実装してください
      expect(true).toBe(false); // 意図的に失敗させる
    });
  });
});
`;
  }

  getFunctionTestTemplate(moduleName, description) {
    return `// ${description}のテスト
const ${moduleName} = require('../../src/utils/${moduleName}');

describe('${moduleName}', () => {
  test('should return expected result', () => {
    // Red: 失敗するテストを最初に書く
    // TODO: 期待される結果をテストしてください
    expect(true).toBe(false); // 意図的に失敗させる
  });

  test('should handle invalid input', () => {
    // TODO: 無効な入力のハンドリングをテストしてください
    expect(true).toBe(false); // 意図的に失敗させる
  });

  test('should handle edge cases', () => {
    // TODO: エッジケースのテストを実装してください
    expect(true).toBe(false); // 意図的に失敗させる
  });
});
`;
  }

  getApiTestTemplate(moduleName, description) {
    return `// ${description} APIのテスト
const request = require('supertest');
const app = require('../../src/app');

describe('${moduleName} API', () => {
  describe('GET /api/${moduleName}', () => {
    test('should return successful response', async () => {
      // Red: 失敗するテストを最初に書く
      const response = await request(app)
        .get('/api/${moduleName}')
        .expect(200);

      // TODO: 期待されるレスポンスの形式を定義してください
      expect(response.body).toEqual({}); // 意図的に失敗させる
    });
  });

  describe('POST /api/${moduleName}', () => {
    test('should create new resource', async () => {
      const testData = {
        // TODO: テストデータを定義してください
      };

      const response = await request(app)
        .post('/api/${moduleName}')
        .send(testData)
        .expect(201);

      // TODO: 作成されたリソースの検証を実装してください
      expect(response.body).toEqual({}); // 意図的に失敗させる
    });
  });
});
`;
  }

  getDefaultTestTemplate(moduleName, description) {
    return `// ${description}のテスト
describe('${moduleName}', () => {
  test('should implement basic functionality', () => {
    // Red: 失敗するテストを最初に書く
    // TODO: 基本機能のテストを実装してください
    expect(true).toBe(false); // 意図的に失敗させる
  });
});
`;
  }
}

// テスト生成を実行
const generator = new TestGenerator();
generator.generateTest().catch(console.error); 