import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface UndoAction {
  id: string;
  type: 'delete_trade' | 'delete_multiple_trades' | 'bulk_update' | 'custom';
  description: string;
  undoFn: () => Promise<void> | void;
  data?: any; // Store original data for reference
  timestamp: number;
  ttl?: number; // Time to live in milliseconds (default 10 seconds)
}

interface UndoNotification {
  action: UndoAction;
  isVisible: boolean;
  timeLeft: number;
}

interface UndoContextType {
  // Core undo functionality
  addUndoAction: (action: Omit<UndoAction, 'id' | 'timestamp'>) => void;
  executeUndo: (actionId: string) => Promise<void>;
  clearUndo: (actionId: string) => void;
  clearAllUndo: () => void;
  
  // Current notification state
  currentNotification: UndoNotification | null;
  isUndoInProgress: boolean;
}

const UndoContext = createContext<UndoContextType | undefined>(undefined);

export const useUndo = () => {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error('useUndo must be used within an UndoProvider');
  }
  return context;
};

interface UndoProviderProps {
  children: ReactNode;
}

export const UndoProvider: React.FC<UndoProviderProps> = ({ children }) => {
  const [actions, setActions] = useState<UndoAction[]>([]);
  const [currentNotification, setCurrentNotification] = useState<UndoNotification | null>(null);
  const [isUndoInProgress, setIsUndoInProgress] = useState(false);
  const [timers, setTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  const generateId = () => `undo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addUndoAction = useCallback((actionData: Omit<UndoAction, 'id' | 'timestamp'>) => {
    const action: UndoAction = {
      ...actionData,
      id: generateId(),
      timestamp: Date.now(),
      ttl: actionData.ttl || 10000 // Default 10 seconds
    };

    // Add to actions list
    setActions(prev => [action, ...prev.slice(0, 4)]); // Keep only last 5 actions

    // Show notification
    const notification: UndoNotification = {
      action,
      isVisible: true,
      timeLeft: action.ttl!
    };
    setCurrentNotification(notification);

    // Start countdown timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, action.ttl! - elapsed);
      
      if (remaining <= 0) {
        // Time expired, clean up
        clearTimeout(timer);
        setTimers(prev => {
          const newTimers = new Map(prev);
          newTimers.delete(action.id);
          return newTimers;
        });
        setCurrentNotification(prev => 
          prev?.action.id === action.id ? null : prev
        );
        setActions(prev => prev.filter(a => a.id !== action.id));
      } else {
        // Update countdown
        setCurrentNotification(prev => 
          prev?.action.id === action.id 
            ? { ...prev, timeLeft: remaining }
            : prev
        );
      }
    }, 100); // Update every 100ms for smooth countdown

    setTimers(prev => new Map(prev).set(action.id, timer));
  }, []);

  const executeUndo = useCallback(async (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    try {
      setIsUndoInProgress(true);
      
      // Clear the timer
      const timer = timers.get(actionId);
      if (timer) {
        clearTimeout(timer);
        setTimers(prev => {
          const newTimers = new Map(prev);
          newTimers.delete(actionId);
          return newTimers;
        });
      }

      // Execute the undo function
      await action.undoFn();

      // Remove from actions and notification
      setActions(prev => prev.filter(a => a.id !== actionId));
      setCurrentNotification(prev => 
        prev?.action.id === actionId ? null : prev
      );

    } catch (error) {
      console.error('Failed to execute undo:', error);
      // Optionally show error message to user
    } finally {
      setIsUndoInProgress(false);
    }
  }, [actions, timers]);

  const clearUndo = useCallback((actionId: string) => {
    const timer = timers.get(actionId);
    if (timer) {
      clearTimeout(timer);
      setTimers(prev => {
        const newTimers = new Map(prev);
        newTimers.delete(actionId);
        return newTimers;
      });
    }

    setActions(prev => prev.filter(a => a.id !== actionId));
    setCurrentNotification(prev => 
      prev?.action.id === actionId ? null : prev
    );
  }, [timers]);

  const clearAllUndo = useCallback(() => {
    // Clear all timers
    timers.forEach(timer => clearTimeout(timer));
    setTimers(new Map());
    
    // Clear all state
    setActions([]);
    setCurrentNotification(null);
  }, [timers]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [timers]);

  const value: UndoContextType = {
    addUndoAction,
    executeUndo,
    clearUndo,
    clearAllUndo,
    currentNotification,
    isUndoInProgress
  };

  return (
    <UndoContext.Provider value={value}>
      {children}
    </UndoContext.Provider>
  );
};