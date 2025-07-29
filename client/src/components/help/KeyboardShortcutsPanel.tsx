import React, { useState } from 'react';
import { KeyboardShortcut, useShortcutDisplay } from '../../hooks/useKeyboardShortcuts';
import { STRINGS } from '../../constants/strings';

interface KeyboardShortcutsPanelProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  shortcuts,
  isOpen,
  onClose
}) => {
  const { displayShortcuts } = useShortcutDisplay(shortcuts);

  if (!isOpen) return null;

  // Group shortcuts by category for better organization
  const groupedShortcuts = displayShortcuts.reduce((groups, shortcut) => {
    let category = 'General';
    
    if (shortcut.description.toLowerCase().includes('trade')) {
      category = 'Trading';
    } else if (shortcut.description.toLowerCase().includes('search') || 
               shortcut.description.toLowerCase().includes('focus')) {
      category = 'Navigation';
    } else if (shortcut.description.toLowerCase().includes('help') ||
               shortcut.description.toLowerCase().includes('mode')) {
      category = 'Help';
    } else if (shortcut.description.toLowerCase().includes('save') ||
               shortcut.description.toLowerCase().includes('export') ||
               shortcut.description.toLowerCase().includes('delete')) {
      category = 'Actions';
    }

    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, typeof displayShortcuts>);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {STRINGS.KEYBOARD_SHORTCUTS}
            </h3>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Shortcuts by category */}
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-900 mb-3 pb-1 border-b border-gray-200">
                  {category}
                </h4>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50">
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center space-x-1">
                        {shortcut.displayText.split(navigator.platform.includes('Mac') ? '' : '+').map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && !navigator.platform.includes('Mac') && (
                              <span className="text-xs text-gray-400">+</span>
                            )}
                            <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 text-gray-600 rounded border border-gray-300">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Shortcuts work when not typing in text fields
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {STRINGS.CLOSE}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing keyboard shortcuts panel
export const useKeyboardShortcutsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const showShortcuts = () => setIsOpen(true);
  const hideShortcuts = () => setIsOpen(false);

  return {
    isOpen,
    showShortcuts,
    hideShortcuts
  };
};