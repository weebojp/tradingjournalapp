import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { STRINGS } from '../../constants/strings';

interface NavigationProps {
  userEmail?: string;
  onLogout: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

const navigationItems: NavItem[] = [
  {
    path: '/',
    label: STRINGS.DASHBOARD,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
      </svg>
    )
  },
  {
    path: '/trades',
    label: STRINGS.TRADES_HISTORY,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    path: '/analytics',
    label: STRINGS.ANALYTICS,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    path: '/strategies',
    label: STRINGS.STRATEGIES,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  }
];

// Helper function to determine if a path is active
const isActivePath = (itemPath: string, currentPath: string): boolean => {
  if (itemPath === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(itemPath);
};

// Generate breadcrumbs from current location
const getBreadcrumbs = (pathname: string) => {
  const breadcrumbs = [{ label: 'Home', path: '/' }];
  
  const pathSegments = pathname.split('/').filter(segment => segment);
  
  if (pathSegments.length === 0) {
    return breadcrumbs;
  }

  // Map path segments to readable names
  const segmentMap: Record<string, string> = {
    'analytics': STRINGS.ANALYTICS,
    'strategies': STRINGS.STRATEGIES,
    'trades': STRINGS.TRADES,
    'settings': STRINGS.SETTINGS
  };

  let currentPath = '';
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`;
    const label = segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, path: currentPath });
  });

  return breadcrumbs;
};

export const Navigation: React.FC<NavigationProps> = ({ userEmail, onLogout }) => {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo/Brand */}
            <Link 
              to="/" 
              className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {STRINGS.APP_NAME}
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex space-x-1">
              {navigationItems.map((item) => {
                const isActive = isActivePath(item.path, location.pathname);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {STRINGS.WELCOME}, {userEmail}
            </span>
            <button
              onClick={onLogout}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              {STRINGS.LOGOUT}
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 1 && (
          <div className="py-2 border-t border-gray-100">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.path} className="flex items-center">
                    {index > 0 && (
                      <svg
                        className="w-4 h-4 mx-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="text-sm font-medium text-gray-500">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
          {navigationItems.map((item) => {
            const isActive = isActivePath(item.path, location.pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};