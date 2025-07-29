#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class CoverageChecker {
  constructor() {
    this.coveragePath = './coverage/coverage-summary.json';
    this.thresholds = {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    };
  }

  checkCoverage() {
    if (!fs.existsSync(this.coveragePath)) {
      console.error('❌ カバレッジファイルが見つかりません');
      console.error('先に "npm run coverage" を実行してください');
      process.exit(1);
    }

    const coverage = JSON.parse(fs.readFileSync(this.coveragePath, 'utf8'));
    const total = coverage.total;

    console.log('\n📊 テストカバレッジレポート\n');
    console.log('================================');

    const results = [];
    
    Object.keys(this.thresholds).forEach(metric => {
      const actual = total[metric].pct;
      const threshold = this.thresholds[metric];
      const status = actual >= threshold ? '✅' : '❌';
      
      console.log(`${status} ${metric.padEnd(12)}: ${actual.toFixed(2)}% (閾値: ${threshold}%)`);
      
      results.push({
        metric,
        actual,
        threshold,
        passed: actual >= threshold
      });
    });

    console.log('================================\n');

    const failedChecks = results.filter(r => !r.passed);
    
    if (failedChecks.length > 0) {
      console.log('❌ カバレッジチェックが失敗しました\n');
      console.log('以下のメトリクスが閾値を下回っています:');
      
      failedChecks.forEach(check => {
        const diff = check.threshold - check.actual;
        console.log(`  • ${check.metric}: ${diff.toFixed(2)}% 不足`);
      });
      
      console.log('\n🔴 Red: より多くのテストが必要です');
      console.log('🟢 Green: テストを追加して実装を完成させてください');
      console.log('🔵 Refactor: カバレッジを向上させてリファクタリングしてください\n');
      
      process.exit(1);
    } else {
      console.log('✅ すべてのカバレッジチェックが成功しました！\n');
      console.log('🎉 TDD開発サイクルが完了しました');
      console.log('🔵 Refactor: コードをリファクタリングして品質を向上させてください\n');
    }
  }

  generateReport() {
    if (!fs.existsSync(this.coveragePath)) {
      console.error('カバレッジファイルが見つかりません');
      return;
    }

    const coverage = JSON.parse(fs.readFileSync(this.coveragePath, 'utf8'));
    const total = coverage.total;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        statements: total.statements.pct,
        branches: total.branches.pct,
        functions: total.functions.pct,
        lines: total.lines.pct
      },
      thresholds: this.thresholds,
      passed: Object.keys(this.thresholds).every(
        metric => total[metric].pct >= this.thresholds[metric]
      )
    };

    const reportPath = './coverage/coverage-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📋 カバレッジレポートが生成されました: ${reportPath}`);
  }
}

// コマンドライン引数の処理
const args = process.argv.slice(2);
const checker = new CoverageChecker();

if (args.includes('--report')) {
  checker.generateReport();
} else {
  checker.checkCoverage();
} 