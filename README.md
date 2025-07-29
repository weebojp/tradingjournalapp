# 📊 Trading Journal App

[![TDD CI](https://github.com/weebojp/tradingjournalapp/workflows/TDD%20Continuous%20Integration/badge.svg)](https://github.com/weebojp/tradingjournalapp/actions)
[![Coverage](https://img.shields.io/badge/coverage-90%25+-brightgreen.svg)](./coverage/lcov-report/index.html)
[![Test Driven](https://img.shields.io/badge/development-test--driven-red.svg)](./docs/TDD_GUIDE.md)
[![React](https://img.shields.io/badge/frontend-React%2018-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)

A comprehensive trading journal application for tracking trades, analyzing performance, and improving trading strategies. Built with modern web technologies and following Test-Driven Development (TDD) principles.

## 🌟 Features

### 📈 Trade Management
- **Create & Edit Trades**: Record entry/exit prices, position sizes, leverage, and notes
- **Real-time P&L Calculation**: Automatic profit/loss calculations with percentage returns
- **Trade History**: Full history with advanced filtering and pagination
- **Bulk Operations**: Close multiple trades at once

### 📊 Analytics & Insights
- **Performance Dashboard**: Key metrics including win rate, total P&L, average win/loss
- **Interactive Charts**: Cumulative P&L visualization with hover details
- **Trade Statistics**: Detailed performance analysis by symbol, time period, and strategy
- **Export Functionality**: Export trade data for external analysis

### 🎯 Strategy Management
- **Strategy Tracking**: Organize trades by trading strategies
- **Performance Comparison**: Compare effectiveness across different strategies
- **Tags & Categories**: Flexible tagging system for trade classification

### 🎨 User Experience
- **Dark Mode Support**: Eye-friendly trading in low-light conditions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Keyboard Shortcuts**: Efficient navigation with customizable hotkeys
- **Help System**: Interactive tooltips and onboarding tour
- **Undo/Redo**: Safely revert accidental changes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/weebojp/tradingjournalapp.git
cd tradingjournalapp

# Install dependencies
npm install
cd client && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma db push
npx prisma generate

# Seed database with sample data (optional)
npm run seed
```

### Running the Application

```bash
# Start the backend server
npm run dev

# In a new terminal, start the frontend
cd client && npm start

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - API communication
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM and database toolkit
- **SQLite** - Database (easily switchable to PostgreSQL/MySQL)
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Development & Testing
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **Supertest** - API testing
- **ESLint** - Code linting
- **GitHub Actions** - CI/CD

## 📁 Project Structure

```
tradingjournalapp/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── analytics/ # Analytics & charts
│   │   │   ├── auth/      # Authentication
│   │   │   ├── common/    # Shared components
│   │   │   ├── dashboard/ # Dashboard views
│   │   │   ├── help/      # Help system
│   │   │   ├── strategies/# Strategy management
│   │   │   └── trades/    # Trade components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
├── src/                   # Backend application
│   ├── middleware/        # Express middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Helper functions
├── tests/                # Backend tests
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── prisma/               # Database schema
├── scripts/              # Development scripts
└── docs/                 # Documentation
```

## 🔧 Available Scripts

### Root Directory
| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend in development mode |
| `npm test` | Run backend tests in watch mode |
| `npm run test:ci` | Run tests with coverage |
| `npm run lint` | Lint backend code |
| `npm run seed` | Seed database with sample data |

### Client Directory
| Command | Description |
|---------|-------------|
| `npm start` | Start React development server |
| `npm run build` | Build for production |
| `npm test` | Run frontend tests |
| `npm run lint` | Lint frontend code |

## 🔴🟢🔵 Test-Driven Development

This project follows strict TDD principles:

1. **Red Phase**: Write failing tests first
2. **Green Phase**: Implement minimal code to pass tests
3. **Refactor Phase**: Improve code while keeping tests green

### Running Tests
```bash
# Backend tests with coverage
npm run test:ci

# Frontend tests
cd client && npm test

# Generate coverage report
npm run coverage
```

### Coverage Requirements
- Statements: 90%+
- Branches: 90%+
- Functions: 90%+
- Lines: 90%+

## 📱 Screenshots

### Dashboard
The main dashboard shows key performance metrics and recent trades.

### Trade Management
Easy-to-use interface for adding, editing, and closing trades.

### Analytics
Interactive charts and detailed performance analytics.

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=8080
NODE_ENV=development

# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
JWT_SECRET=your-secret-key-here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow TDD**: Write tests first, then implementation
4. **Maintain coverage**: Ensure 90%+ test coverage
5. **Commit changes**: Use clear, descriptive commit messages
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**: Describe your changes clearly

### Commit Convention
We follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

## 📈 Roadmap

- [ ] Multi-currency support
- [ ] Advanced charting indicators
- [ ] Mobile app (React Native)
- [ ] Social features (share strategies)
- [ ] AI-powered trade analysis
- [ ] Automated strategy backtesting
- [ ] Integration with broker APIs
- [ ] Real-time market data

## 🐛 Known Issues

- Chart hover accuracy on mobile devices
- Large dataset performance optimization needed
- Export function limited to CSV format

## 📚 Documentation

- [TDD Development Guide](./docs/TDD_GUIDE.md) - Detailed TDD practices
- [API Documentation](./docs/API.md) - RESTful API endpoints
- [Architecture](./docs/ARCHITECTURE.md) - System design decisions
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment

## 🙏 Acknowledgments

- Built with ❤️ using React and Node.js
- UI components inspired by Tailwind UI
- Charts powered by Recharts
- Icons from Heroicons

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Trading! 📈🚀**

For support, email: support@tradingjournalapp.com or open an issue on GitHub.