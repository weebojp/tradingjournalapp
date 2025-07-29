import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
  condition?: () => boolean; // Optional condition to check if shortcut should be active
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true
}: UseKeyboardShortcutsOptions) => {
  const handleKeydown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      // Check if condition is met (if provided)
      if (shortcut.condition && !shortcut.condition()) {
        return false;
      }

      // Check key match
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      
      // Check modifier keys
      const metaMatch = (shortcut.metaKey ?? false) === (event.metaKey || event.ctrlKey);
      const ctrlMatch = (shortcut.ctrlKey ?? false) === event.ctrlKey;
      const altMatch = (shortcut.altKey ?? false) === event.altKey;
      const shiftMatch = (shortcut.shiftKey ?? false) === event.shiftKey;

      return keyMatch && metaMatch && ctrlMatch && altMatch && shiftMatch;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      matchingShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  return { shortcuts };
};

// Predefined shortcuts for common actions
export const createCommonShortcuts = (actions: {
  onAddTrade?: () => void;
  onRefresh?: () => void;
  onToggleHelp?: () => void;
  onFocusSearch?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onExport?: () => void;
}): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.onAddTrade) {
    shortcuts.push({
      key: 'n',
      metaKey: true,
      description: 'Add New Trade',
      action: actions.onAddTrade
    });
  }

  if (actions.onRefresh) {
    shortcuts.push({
      key: 'r',
      metaKey: true,
      description: 'Refresh Data',
      action: actions.onRefresh
    });
  }

  if (actions.onToggleHelp) {
    shortcuts.push({
      key: '?',
      description: 'Toggle Help Mode',
      action: actions.onToggleHelp
    });
  }

  if (actions.onFocusSearch) {
    shortcuts.push({
      key: '/',
      description: 'Focus Search',
      action: actions.onFocusSearch
    });
  }

  if (actions.onSave) {
    shortcuts.push({
      key: 's',
      metaKey: true,
      description: 'Save',
      action: actions.onSave
    });
  }

  if (actions.onCancel) {
    shortcuts.push({
      key: 'Escape',
      description: 'Cancel/Close',
      action: actions.onCancel
    });
  }

  if (actions.onDelete) {
    shortcuts.push({
      key: 'Delete',
      description: 'Delete Selected',
      action: actions.onDelete
    });
  }

  if (actions.onEdit) {
    shortcuts.push({
      key: 'e',
      metaKey: true,
      description: 'Edit Selected',
      action: actions.onEdit
    });
  }

  if (actions.onExport) {
    shortcuts.push({
      key: 'e',
      metaKey: true,
      shiftKey: true,
      description: 'Export Data',
      action: actions.onExport
    });
  }

  return shortcuts;
};

// Hook for displaying keyboard shortcuts
export const useShortcutDisplay = (shortcuts: KeyboardShortcut[]) => {
  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const keys: string[] = [];
    
    if (shortcut.metaKey) {
      keys.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) {
      keys.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
    }
    if (shortcut.shiftKey) {
      keys.push(navigator.platform.includes('Mac') ? '⇧' : 'Shift');
    }
    
    // Format the main key
    let mainKey = shortcut.key;
    if (mainKey === ' ') mainKey = 'Space';
    if (mainKey === 'Escape') mainKey = 'Esc';
    if (mainKey === 'Delete') mainKey = 'Del';
    if (mainKey === '?') mainKey = '?';
    if (mainKey === '/') mainKey = '/';
    
    keys.push(mainKey.toUpperCase());
    
    return keys.join(navigator.platform.includes('Mac') ? '' : '+');
  };

  return {
    formatShortcut,
    displayShortcuts: shortcuts.map(shortcut => ({
      ...shortcut,
      displayText: formatShortcut(shortcut)
    }))
  };
};