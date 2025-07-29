import { ApiClient } from '../api';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn()
        }
      }
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    apiClient = new ApiClient('http://localhost:8080');
  });

  describe('authentication', () => {
    test('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123'
      };

      const expectedResponse = {
        message: 'User registered successfully',
        user: {
          id: 'user123',
          email: userData.email,
          createdAt: new Date().toISOString()
        }
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: expectedResponse });

      const result = await apiClient.register(userData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/register', userData);
      expect(result).toEqual(expectedResponse);
    });

    test('should login user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'securePassword123'
      };

      const expectedResponse = {
        token: 'jwt.token.here',
        user: {
          id: 'user123',
          email: loginData.email,
          createdAt: new Date().toISOString()
        }
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: expectedResponse });

      const result = await apiClient.login(loginData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', loginData);
      expect(result).toEqual(expectedResponse);
    });

    test('should get current user info', async () => {
      const expectedUser = {
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date().toISOString()
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: expectedUser });

      const user = await apiClient.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me');
      expect(user).toEqual(expectedUser);
    });
  });

  describe('trades', () => {
    beforeEach(() => {
      apiClient.setToken('valid.jwt.token');
    });

    test('should get user trades', async () => {
      const expectedResponse = {
        trades: [
          {
            id: 'trade1',
            userId: 'user123',
            tradeDate: new Date().toISOString(),
            symbol: 'BTC/USDT',
            side: 'LONG' as const,
            entryPrice: 45000,
            positionSize: 0.1,
            tags: []
          }
        ],
        pagination: {
          total: 1,
          limit: 100,
          offset: 0
        }
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: expectedResponse });

      const trades = await apiClient.getTrades();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/trades', { params: undefined });
      expect(trades).toEqual(expectedResponse);
    });

    test('should create a new trade', async () => {
      const tradeData = {
        tradeDate: new Date().toISOString(),
        symbol: 'BTC/USDT',
        side: 'LONG' as const,
        entryPrice: 45000,
        positionSize: 0.1,
        leverage: 5,
        notes: 'Test trade'
      };

      const expectedTrade = {
        id: 'trade123',
        userId: 'user123',
        ...tradeData,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: expectedTrade });

      const trade = await apiClient.createTrade(tradeData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/trades', tradeData);
      expect(trade).toEqual(expectedTrade);
    });

    test('should update a trade', async () => {
      const tradeId = 'trade123';
      const updateData = {
        exitPrice: 47000,
        pnl: 200,
        exitDate: new Date().toISOString()
      };

      const expectedUpdatedTrade = {
        id: tradeId,
        userId: 'user123',
        symbol: 'BTC/USDT',
        side: 'LONG' as const,
        entryPrice: 45000,
        positionSize: 0.1,
        ...updateData,
        tags: []
      };

      mockAxiosInstance.put.mockResolvedValueOnce({ data: expectedUpdatedTrade });

      const updatedTrade = await apiClient.updateTrade(tradeId, updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/api/trades/${tradeId}`, updateData);
      expect(updatedTrade).toEqual(expectedUpdatedTrade);
    });

    test('should delete a trade', async () => {
      const tradeId = 'trade123';

      mockAxiosInstance.delete.mockResolvedValueOnce({ data: {} });

      await apiClient.deleteTrade(tradeId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/api/trades/${tradeId}`);
    });

    test('should get trade statistics', async () => {
      const expectedStats = {
        totalTrades: 50,
        totalPnL: 1500.00,
        winRate: 0.6,
        avgWin: 200.00,
        avgLoss: 125.00
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: expectedStats });

      const stats = await apiClient.getTradeStats();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/trades/stats');
      expect(stats).toEqual(expectedStats);
    });
  });
});