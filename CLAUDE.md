# Trading Journal App

## Project Overview
A modern trading journal application for tracking trades, analyzing performance, and managing trading data.

## Tech Stack (Current)
- **Backend**: Node.js + Express.js
- **Testing**: Jest v29.7.0 
- **Code Quality**: ESLint
- **Development**: Nodemon

## Tech Stack (Planned for Frontend)
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Context API or Redux Toolkit
- **Build Tool**: Vite

## 📝 Development Log Management Rules - CRITICAL FOR ALL DEVELOPMENT

### 基本原則
Claude開発において、**すべての開発活動は確実にログを残す**ことが必須です。これにより、進行状況の把握、問題の追跡、知識の蓄積が可能になります。

### 1. 開発セッション開始時のログ
```markdown
## 📅 [YYYY-MM-DD HH:MM] 開発セッション開始

### 目標
- [ ] 実装予定の機能
- [ ] 解決予定の問題
- [ ] テスト予定の項目

### 現在の状態
- 前回のセッションで完了した項目
- 未解決の問題・エラー
- 次に取り組むべきタスク
```

### 2. TDDサイクルごとのログ
**各Red-Green-Refactorサイクルで必ず記録:**

```markdown
### 🔴 Red: [機能名] - [HH:MM]
- **テスト内容**: どのようなテストを書いたか
- **期待する失敗**: なぜテストが失敗するべきか
- **テストコード**: 
  ```javascript
  // テストコードを貼り付け
  ```

### 🟢 Green: [機能名] - [HH:MM]
- **実装内容**: 最小限の実装で何を書いたか
- **テスト結果**: ✅ 成功 / ❌ 失敗
- **実装コード**:
  ```javascript
  // 実装コードを貼り付け
  ```

### 🔵 Refactor: [機能名] - [HH:MM]
- **リファクタリング内容**: 何を改善したか
- **テスト結果**: ✅ すべて成功 / ❌ 失敗
- **改善後のコード**:
  ```javascript
  // リファクタリング後のコードを貼り付け
  ```
```

### 3. エラー・問題発生時のログ
```markdown
### ❌ エラー・問題 - [HH:MM]
- **エラー内容**: 
  ```
  エラーメッセージやスタックトレース
  ```
- **発生条件**: どの操作で発生したか
- **試行した解決方法**: 
  1. 試したこと1
  2. 試したこと2
- **解決方法**: 最終的にどう解決したか
- **学んだこと**: 今後同じ問題を避けるために
```

### 4. 機能完成時のログ
```markdown
### ✅ 機能完成: [機能名] - [HH:MM]
- **実装した機能**: 詳細な説明
- **テストカバレッジ**: XX%
- **ファイル構成**:
  - `src/xxx.js` - 実装
  - `tests/unit/xxx.test.js` - テスト
- **動作確認**: 
  - [ ] ユニットテスト ✅
  - [ ] 統合テスト ✅
  - [ ] 手動テスト ✅
```

### 5. ログ管理のルール

#### 必須ルール
1. **毎回のセッション開始・終了時にログを記録**
2. **TDDの各フェーズで状況を記録**
3. **エラーが発生したら即座にログに記録**
4. **コードの変更は必ずコードブロックで記録**
5. **テスト結果は具体的に記録（成功/失敗）**

#### ログの品質向上
- **具体的で詳細**：「うまくいかない」ではなく「XXXエラーでテストが失敗」
- **タイムスタンプ必須**：いつ何が起こったかを明確に
- **コードは必ず貼り付け**：後で振り返れるように
- **学びを記録**：同じ問題を繰り返さないために

---

## 🔴🟢🔵 Test-Driven Development (TDD)

### CRITICAL: All development MUST follow TDD methodology
This project enforces strict Test-Driven Development. **No code should be written without tests first.**

### TDD Cycle
1. **🔴 Red**: Write a failing test first
2. **🟢 Green**: Write minimal code to make the test pass
3. **🔵 Refactor**: Improve code while keeping tests green

### Test Coverage Requirements
- **Minimum 90% coverage** for all metrics (branches, functions, lines, statements)
- Coverage is automatically checked and enforced

### TDD Commands
```bash
# Install dependencies
npm install

# TDD watch mode (auto-runs tests on file changes)
npm test
node scripts/tdd-watch.js  # Enhanced TDD mode

# Generate new test file (interactive)
node scripts/test-generator.js

# Check coverage
npm run coverage
node scripts/coverage-check.js

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# CI mode (with coverage)
npm run test:ci
```

## Development Workflow

### Before Writing ANY Code:
1. Create a test file in appropriate directory:
   - Unit tests: `tests/unit/[ModuleName].test.js`
   - Integration tests: `tests/integration/[FeatureName].test.js`
   - E2E tests: `tests/e2e/[Scenario].test.js`

2. Write failing test following Arrange-Act-Assert pattern
3. Run test to confirm it fails
4. Implement minimal code to pass test
5. Refactor while keeping tests green

### Test Structure Example
```javascript
describe('ModuleName', () => {
  describe('functionName', () => {
    test('should perform expected behavior', () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

## Project Structure (Current)
```
src/                    # Source code (Partially implemented)
  middleware/          # Express middleware
    auth.js           # Authentication middleware (⚠️ has bugs)
  models/             # Data models
    User.js           # User model (✅ complete)
    Trade.js          # Trade model (✅ complete)
    Tag.js            # Tag model (✅ complete)
  services/           # Business logic services
    auth.js           # Authentication service (⚠️ has bugs)
    database.js       # Database service (⚠️ has bugs)
  utils/              # Utility functions
    statistics.js     # Statistics calculations (✅ complete)
    TradeCalculator.js # Sample calculator (✅ complete)
  app.js              # Express application setup (✅ complete)
  index.js            # Server entry point (✅ complete)

tests/                 # Test files (14 test files)
  unit/               # Unit tests
    middleware/       # Middleware tests
    models/          # Model tests (✅ all passing)
    services/        # Service tests (⚠️ some failing)
    utils/           # Utility tests (✅ all passing)
  integration/        # Integration tests
    api/             # API endpoint tests (📝 written, waiting for implementation)
  setup.js           # Test environment setup

scripts/              # Development tools
  tdd-watch.js       # Enhanced TDD watch mode
  test-generator.js  # Interactive test generator
  coverage-check.js  # Coverage validation

docs/
  TDD_GUIDE.md      # Comprehensive TDD guide (Japanese)

prisma/               # Database schema
  schema.prisma     # Prisma schema definition (✅ complete)

.env                  # Environment variables (Port 8080, JWT secret, DB URL)
```

## Code Quality Commands
```bash
# Lint code
npm run lint

# Type check (when TypeScript is added)
npm run typecheck

# Format code
npm run format
```

## Key Features
- Trade entry and management
- Performance analytics and metrics
- P&L tracking
- Trade filtering and search
- Export functionality
- Dashboard with visualizations

## Important Notes for Claude

### MUST Follow TDD:
1. **NEVER write implementation code without a failing test first**
2. **Always verify test fails before implementing**
3. **Keep test-to-code ratio high (aim for 1:1 or higher)**
4. **Run tests after EVERY change**

### Testing Best Practices:
- One test should test one thing
- Use descriptive test names with "should..." format
- Follow Arrange-Act-Assert pattern
- Keep tests independent (no shared state)
- Use custom matchers (e.g., `toBeValidTrade`)

### Development Commands Priority:
1. Always start with: `npm test` (watch mode)
2. Before committing: `npm run test:ci` (ensures coverage)
3. Check coverage: `npm run coverage`
4. Validate code: `npm run lint`

### File Conventions:
- Test files: `*.test.js` or `*.spec.js`
- Place tests close to implementation (when src/ is created)
- Use meaningful file and function names
- Follow existing patterns in test files

### Current State:
- Project has comprehensive test infrastructure
- No implementation code yet (following TDD)
- Backend uses Express.js (see package.json)
- Frontend will use React (not implemented yet)

### References:
- See `docs/TDD_GUIDE.md` for detailed TDD instructions (Japanese)
- Check existing tests in `tests/` for patterns
- Use test generator script for consistency

## Recent Updates (2025-07-28)

### Trade Management Improvements
- **Exit Price Display**: Added exit price column to TradeList component
  - Shows formatted exit price for closed trades
  - Displays "-" for open trades
  - Exit price and exit date are visible in TradeDetailModal
  
### P&L Chart Complete Redesign (PnLChartV2)
- **Root cause analysis**: SVG coordinate transformation and tooltip positioning issues
- **New Architecture**:
  - Precise SVG coordinate transformation using `createSVGPoint()` and `getScreenCTM()`
  - Interactive hover areas for each data point (40px wide zones)
  - React Portal-based tooltip system for proper z-index layering
- **Tooltip Improvements**:
  - Automatic position adjustment to prevent screen edge overflow
  - Enhanced visual design with arrow pointer and smooth animations
  - Portal rendering to document.body for proper positioning
- **Debug Features**:
  - Development mode debug visualization
  - Real-time coordinate tracking and validation
- **Performance Optimizations**:
  - Memoized dimensions and calculations
  - Proper React hooks dependencies
  - Optimized re-render behavior

### Enhanced Hover Interactions (Latest Update)
- **Precision Hover Line**: Vertical blue dashed line shows exact hover position
- **Date Label**: Current date displayed in blue badge at chart bottom
- **Y-axis Value Indicator**: Dynamic value display on Y-axis with auto-sizing
- **Data Point Enhancement**: 
  - Hovered points turn blue with glow effect and pulsing outer ring
  - Smooth transitions and animations for all hover states
- **Y-axis Zero Line Fix**: 
  - Intelligent grid calculation ensures 0 is always visible
  - Proper range adjustment for positive, negative, and mixed data
  - Enhanced zero line styling (thicker, black line)

### Minimal Design Update (Final Version)
- **Clean Interface**: Removed all visible data points for cleaner look
- **Hover-Only Interaction**: Data points only appear when hovered
- **No Axis Labels**: Removed X and Y axis labels for minimal design
- **Simplified Grid**: Only subtle zero line visible
- **Compact Layout**: Reduced margins for more space-efficient design
- **Essential Info Only**: All information available through interactive hover states

### Enhanced Color Scheme (Final Update)
- **Dynamic Line Color**: 
  - Dark green (#15803d) for positive final P&L
  - Dark red (#dc2626) for negative final P&L
  - Thicker line (2.5px) for better visibility
- **Gradient Area Fills**:
  - Positive area: Green gradient (dark to light, top to bottom)
  - Negative area: Red gradient (light to dark, top to bottom)
  - Subtle opacity for professional appearance

## Trade History Page Implementation (2025-07-28)

### Problem Solved
- **Missing Navigation**: Users could only see 5 recent trades on dashboard
- **No Complete History**: No way to view all trades with filtering/pagination

### New Features Added
- **TradesHistoryPage**: Complete trade management with pagination (20 trades/page)
- **Advanced Filtering**: Symbol, side (LONG/SHORT), date range filters
- **Navigation Integration**: Added "Trade History" link to main navigation
- **Dashboard Link**: "View All Trades" button in Recent Trades section
- **Full Trade Management**: View, edit, close, delete operations
- **Statistics Summary**: Total trades, win rate, total P&L, average trade
- **Responsive Pagination**: Previous/Next with page numbers
- **Error Handling**: User-friendly error display with retry functionality
- **Undo Support**: Integrated with existing undo system for deletions

### Technical Implementation
- **Route**: `/trades` path added to App.tsx routing
- **API Integration**: Uses existing pagination parameters (limit, offset)
- **Component Reuse**: Leverages TradeList, modals, and confirmation dialogs
- **State Management**: Proper loading states and error handling
- **Type Safety**: Full TypeScript integration with proper API response types

### Enhanced Pagination System (Latest Update)
- **Smart Page Numbers**: Dynamic pagination display with ellipsis (e.g., 1 ... 5 6 7 ... 20)
- **Configurable Page Size**: 10, 20, 50, or 100 trades per page selector
- **Jump to Page**: Direct page navigation with input field and "Go" button
- **Professional Layout**: Mobile-responsive design with proper spacing
- **Keyboard Support**: Enter key support for page jumping
- **Total Results Display**: Shows "X to Y of Z results" for clarity
- **Edge Cases**: Proper handling of first/last pages and single page scenarios

**Example for 400 total trades:**
- **Default**: 20 trades/page = 20 pages
- **Flexible**: Can show 50/page = 8 pages or 100/page = 4 pages
- **Navigation**: 1 ... 8 9 10 ... 20 (dynamic based on current page)
- **Jump Feature**: "Go to page: [15] [Go]" for quick navigation