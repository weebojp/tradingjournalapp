#!/usr/bin/env node

const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

class TDDWatcher {
  constructor() {
    this.isRunning = false;
    this.currentTest = null;
  }

  start() {
    console.log('🔴 TDD監視モードを開始します...');
    console.log('Red-Green-Refactorサイクルをサポートします\n');

    // ファイル変更の監視
    const watcher = chokidar.watch(['src/**/*.js', 'tests/**/*.js'], {
      ignored: /node_modules/,
      persistent: true
    });

    watcher.on('change', (filePath) => {
      this.handleFileChange(filePath);
    });

    watcher.on('add', (filePath) => {
      console.log(`📁 新しいファイルが追加されました: ${filePath}`);
      this.handleFileChange(filePath);
    });

    // 初回テスト実行
    this.runTests();
  }

  handleFileChange(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`📝 ファイル変更を検出: ${relativePath}`);

    // テストファイルか実装ファイルかを判定
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      console.log('🔴 Red: テストファイルが変更されました');
    } else {
      console.log('🟢 Green: 実装ファイルが変更されました');
    }

    this.runTests();
  }

  runTests() {
    if (this.isRunning) {
      console.log('⏳ テスト実行中のため待機中...');
      return;
    }

    this.isRunning = true;
    console.log('\n🧪 テストを実行中...\n');

    const jest = spawn('npm', ['run', 'test:ci'], {
      stdio: 'inherit',
      shell: true
    });

    jest.on('close', (code) => {
      this.isRunning = false;
      
      if (code === 0) {
        console.log('\n✅ すべてのテストが成功しました！');
        console.log('🔵 Refactor: コードをリファクタリングしてください\n');
      } else {
        console.log('\n❌ テストが失敗しました');
        console.log('🔴 Red: 失敗したテストを修正してください\n');
      }
      
      console.log('ファイル変更を監視中...\n');
    });

    jest.on('error', (error) => {
      console.error('テスト実行エラー:', error);
      this.isRunning = false;
    });
  }
}

// TDD監視開始
const watcher = new TDDWatcher();
watcher.start();

// Ctrl+Cでの終了処理
process.on('SIGINT', () => {
  console.log('\n👋 TDD監視モードを終了します');
  process.exit(0);
}); 