import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HelpProvider } from './contexts/HelpContext';
import { UndoProvider } from './contexts/UndoContext';
import { STRINGS } from './constants/strings';
import { LoginForm, LoginFormData } from './components/auth/LoginForm';
import { RegisterForm, RegisterFormData } from './components/auth/RegisterForm';
import { TradingDashboard } from './components/dashboard/TradingDashboard';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { StrategiesPage } from './components/strategies/StrategiesPage';
import { StrategyDetailPage } from './components/strategies/StrategyDetailPage';
import { TradesHistoryPage } from './components/trades/TradesHistoryPage';
import { Navigation } from './components/navigation/Navigation';
import { UndoNotification } from './components/common/UndoNotification';

const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation userEmail={user?.email} onLogout={logout} />
        
        <main>
          <Routes>
            <Route path="/" element={<TradingDashboard />} />
            <Route path="/trades" element={<TradesHistoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/strategies" element={<StrategiesPage />} />
            <Route path="/strategies/:strategyName" element={<StrategyDetailPage />} />
          </Routes>
        </main>
        
        {/* Global Undo Notification */}
        <UndoNotification />
      </div>
    </Router>
  );
};

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, loading, error } = useAuth();

  const handleLogin = async (data: LoginFormData) => {
    await login(data);
  };

  const handleRegister = async (data: RegisterFormData) => {
    await register(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {STRINGS.APP_NAME}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? STRINGS.SIGN_IN_TO_ACCOUNT : STRINGS.CREATE_NEW_ACCOUNT}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLogin ? (
            <LoginForm onLogin={handleLogin} loading={loading} error={error || undefined} />
          ) : (
            <RegisterForm onRegister={handleRegister} loading={loading} error={error || undefined} />
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? STRINGS.DONT_HAVE_ACCOUNT : STRINGS.ALREADY_HAVE_ACCOUNT}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isLogin ? STRINGS.REGISTER : STRINGS.SIGN_IN_INSTEAD}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  return user ? <AuthenticatedApp /> : <AuthPage />;
};

function App() {
  return (
    <AuthProvider>
      <HelpProvider>
        <UndoProvider>
          <AppContent />
        </UndoProvider>
      </HelpProvider>
    </AuthProvider>
  );
}

export default App;
