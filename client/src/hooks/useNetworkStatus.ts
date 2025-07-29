import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  });

  const updateNetworkStatus = () => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    const status: NetworkStatus = {
      isOnline: navigator.onLine,
      isSlowConnection: false,
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0
    };

    if (connection) {
      status.effectiveType = connection.effectiveType || 'unknown';
      status.downlink = connection.downlink || 0;
      status.rtt = connection.rtt || 0;
      
      // Consider connection slow if it's 2G or has low downlink speed
      status.isSlowConnection = 
        status.effectiveType === '2g' || 
        status.effectiveType === 'slow-2g' ||
        status.downlink < 1.5;
    }

    setNetworkStatus(status);
  };

  useEffect(() => {
    // Initial status
    updateNetworkStatus();

    // Event listeners
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Connection change listener
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};