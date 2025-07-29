import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiClient, User, LoginData, RegisterData } from '../services/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        apiClient.setToken(savedToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiClient.login(data);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Register the user
      await apiClient.register(data);
      
      // After successful registration, automatically log them in
      const loginResponse = await apiClient.login({
        email: data.email,
        password: data.password
      });
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(loginResponse.user));
      localStorage.setItem('token', loginResponse.token);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: loginResponse.user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear localStorage and state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      apiClient.clearToken();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};