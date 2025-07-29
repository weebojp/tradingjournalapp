describe('Application Entry Point', () => {
  let mockApp;
  let mockServer;
  
  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    // Reset modules
    jest.resetModules();
    
    // Mock the app module
    mockApp = {
      listen: jest.fn((port, callback) => {
        mockServer = { 
          port,
          close: jest.fn((cb) => cb && cb())
        };
        if (callback) callback();
        return mockServer;
      })
    };
    
    jest.doMock('../../src/app', () => mockApp);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
    if (mockServer && mockServer.close) {
      mockServer.close();
    }
  });
  
  test('should start the server on the specified port', () => {
    process.env.PORT = '3000';
    
    require('../../src/index');
    
    expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('🚀 Server running on port 3000');
  });
  
  test('should use default port 5000 if PORT env is not set', () => {
    delete process.env.PORT;
    
    require('../../src/index');
    
    expect(mockApp.listen).toHaveBeenCalledWith(5000, expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('🚀 Server running on port 5000');
  });
  
  test('should handle server startup errors', () => {
    mockApp.listen = jest.fn(() => {
      throw new Error('Port already in use');
    });
    
    expect(() => {
      require('../../src/index');
    }).toThrow('Port already in use');
    
    expect(console.error).toHaveBeenCalledWith('Failed to start server:', expect.any(Error));
  });
});

describe('Graceful Shutdown', () => {
  let mockApp;
  let mockServer;
  let processExit;
  
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    processExit = jest.spyOn(process, 'exit').mockImplementation();
    
    jest.resetModules();
    
    mockServer = {
      close: jest.fn((callback) => callback && callback())
    };
    
    mockApp = {
      listen: jest.fn(() => mockServer)
    };
    
    jest.doMock('../../src/app', () => mockApp);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('should handle SIGTERM signal gracefully', () => {
    require('../../src/index');
    
    // Simulate SIGTERM
    process.emit('SIGTERM');
    
    expect(console.log).toHaveBeenCalledWith('\nSIGTERM received. Closing server gracefully...');
    expect(mockServer.close).toHaveBeenCalled();
    
    // Simulate server.close callback
    const closeCallback = mockServer.close.mock.calls[0][0];
    closeCallback();
    
    expect(console.log).toHaveBeenCalledWith('Server closed.');
    expect(processExit).toHaveBeenCalledWith(0);
  });
  
  test('should handle SIGINT signal gracefully', () => {
    require('../../src/index');
    
    // Simulate SIGINT (Ctrl+C)
    process.emit('SIGINT');
    
    expect(console.log).toHaveBeenCalledWith('\nSIGINT received. Closing server gracefully...');
    expect(mockServer.close).toHaveBeenCalled();
    
    // Simulate server.close callback
    const closeCallback = mockServer.close.mock.calls[0][0];
    closeCallback();
    
    expect(console.log).toHaveBeenCalledWith('Server closed.');
    expect(processExit).toHaveBeenCalledWith(0);
  });
});