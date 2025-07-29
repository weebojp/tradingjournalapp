import axios, { AxiosInstance } from 'axios';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface Trade {
  id: string;
  userId: string;
  tradeDate: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  positionSize: number;
  leverage?: number;
  notes?: string;
  pnl?: number;
  exitDate?: string;
  durationSec?: number;
  tags?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTradeData {
  tradeDate: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  positionSize: number;
  leverage?: number;
  notes?: string;
}

export interface UpdateTradeData {
  exitPrice?: number;
  pnl?: number;
  exitDate?: string;
  notes?: string;
}

export interface TradesResponse {
  trades: Trade[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface TradeStats {
  // Basic metrics
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  
  // Advanced metrics
  profitFactor: number;
  expectancy: number;
  payoffRatio: number;
  winLossRatio: number;
  recoveryFactor: number;
  
  // Streak analysis
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'breakeven' | 'none';
  
  // Extreme trades
  largestWin: number;
  largestLoss: number;
  
  // Detailed metrics
  grossProfit: number;
  grossLoss: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    const response = await this.client.post('/api/auth/register', userData);
    return response.data;
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await this.client.post('/api/auth/login', loginData);
    const { token } = response.data;
    this.setToken(token);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/api/auth/logout');
    this.clearToken();
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  async getTrades(params?: {
    limit?: number;
    offset?: number;
    symbol?: string;
    side?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TradesResponse> {
    const response = await this.client.get('/api/trades', { params });
    return response.data;
  }

  async createTrade(tradeData: CreateTradeData): Promise<Trade> {
    const response = await this.client.post('/api/trades', tradeData);
    return response.data;
  }

  async updateTrade(tradeId: string, updateData: UpdateTradeData): Promise<Trade> {
    const response = await this.client.put(`/api/trades/${tradeId}`, updateData);
    return response.data;
  }

  async deleteTrade(tradeId: string): Promise<void> {
    await this.client.delete(`/api/trades/${tradeId}`);
  }

  async getTradeStats(): Promise<TradeStats> {
    const response = await this.client.get('/api/trades/stats');
    return response.data;
  }
}

// Create a default instance
export const apiClient = new ApiClient(
  process.env.REACT_APP_API_URL || 'http://localhost:8080'
);