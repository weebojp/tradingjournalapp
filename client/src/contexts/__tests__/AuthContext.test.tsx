import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { apiClient } from '../../services/api';

// Mock the API client
jest.mock('../../services/api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { user, login, register, logout, loading, error } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? user.email : 'Not logged in'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      
      <button 
        onClick={async () => {
          try {
            await login({ email: 'test@example.com', password: 'password' });
          } catch (error) {
            // Error is handled by the AuthContext
          }
        }}
        data-testid="login-btn"
      >
        Login
      </button>
      
      <button 
        onClick={() => register({ 
          email: 'test@example.com', 
          password: 'password', 
          confirmPassword: 'password' 
        })}
        data-testid="register-btn"
      >
        Register
      </button>
      
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should provide initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('Not logged in');
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
  });

  test('should handle successful login', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      createdAt: '2025-01-26T00:00:00Z'
    };

    const mockAuthResponse = {
      token: 'jwt.token.here',
      user: mockUser
    };

    mockApiClient.login.mockResolvedValueOnce(mockAuthResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    // Should show loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    expect(mockApiClient.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  test('should handle successful registration', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      createdAt: '2025-01-26T00:00:00Z'
    };

    const mockRegisterResponse = {
      message: 'User registered successfully',
      user: mockUser
    };

    const mockLoginResponse = {
      token: 'test-token',
      user: mockUser
    };

    mockApiClient.register.mockResolvedValueOnce(mockRegisterResponse);
    mockApiClient.login.mockResolvedValueOnce(mockLoginResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    expect(mockApiClient.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password'
    });
    
    expect(mockApiClient.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  test('should handle login error', async () => {
    mockApiClient.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });
  });

  test('should handle logout', async () => {
    // First login
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      createdAt: '2025-01-26T00:00:00Z'
    };

    const mockAuthResponse = {
      token: 'jwt.token.here',
      user: mockUser
    };

    mockApiClient.login.mockResolvedValueOnce(mockAuthResponse);
    mockApiClient.logout.mockResolvedValueOnce();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login first
    fireEvent.click(screen.getByTestId('login-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    // Then logout
    fireEvent.click(screen.getByTestId('logout-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Not logged in');
    });

    expect(mockApiClient.logout).toHaveBeenCalled();
  });

  test('should persist user in localStorage', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      createdAt: '2025-01-26T00:00:00Z'
    };

    const mockAuthResponse = {
      token: 'jwt.token.here',
      user: mockUser
    };

    mockApiClient.login.mockResolvedValueOnce(mockAuthResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
      expect(localStorage.getItem('token')).toBe('jwt.token.here');
    });
  });
});