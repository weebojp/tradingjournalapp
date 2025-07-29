// Centralized string constants for consistent language usage
// This file serves as the single source of truth for all UI text

export const STRINGS = {
  // App Title
  APP_NAME: 'Trading Journal',
  
  // Navigation
  DASHBOARD: 'Dashboard',
  ANALYTICS: 'Analytics',
  STRATEGIES: 'Strategies',
  TRADES: 'Trades',
  TRADES_HISTORY: 'Trade History',
  SETTINGS: 'Settings',
  
  // Authentication
  LOGIN: 'Sign In',
  LOGOUT: 'Sign Out',
  REGISTER: 'Create Account',
  EMAIL: 'Email',
  PASSWORD: 'Password',
  CONFIRM_PASSWORD: 'Confirm Password',
  WELCOME: 'Welcome',
  SIGN_IN_TO_ACCOUNT: 'Sign in to your account',
  CREATE_NEW_ACCOUNT: 'Create a new account',
  DONT_HAVE_ACCOUNT: "Don't have an account?",
  ALREADY_HAVE_ACCOUNT: 'Already have an account?',
  SIGN_IN_INSTEAD: 'Sign in instead',
  
  // Dashboard
  TRADING_DASHBOARD: 'Trading Dashboard',
  DASHBOARD_SUBTITLE: 'Overview of your trading performance',
  RECENT_TRADES: 'Recent Trades',
  RECENT_TRADES_SUBTITLE: 'Your latest trading activity',
  PERFORMANCE_METRICS: 'Performance Metrics',
  
  // Statistics
  TOTAL_TRADES: 'Total Trades',
  TOTAL_PNL: 'Total P&L',
  WIN_RATE: 'Win Rate',
  AVERAGE_WIN: 'Average Win',
  AVERAGE_LOSS: 'Average Loss',
  PROFIT_FACTOR: 'Profit Factor',
  SHARPE_RATIO: 'Sharpe Ratio',
  MAX_DRAWDOWN: 'Max Drawdown',
  
  // Trading
  TRADE: 'Trade',
  SYMBOL: 'Symbol',
  SIDE: 'Side',
  LONG: 'Long',
  SHORT: 'Short',
  ENTRY_PRICE: 'Entry Price',
  EXIT_PRICE: 'Exit Price',
  POSITION_SIZE: 'Position Size',
  LEVERAGE: 'Leverage',
  TRADE_DATE: 'Trade Date',
  ENTRY_DATE: 'Entry Date',
  EXIT_DATE: 'Exit Date',
  NOTES: 'Notes',
  STATUS: 'Status',
  OPEN: 'Open',
  CLOSED: 'Closed',
  
  // Actions
  ADD: 'Add',
  EDIT: 'Edit',
  DELETE: 'Delete',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  CLOSE: 'Close',
  VIEW: 'View',
  REFRESH: 'Refresh',
  FILTER: 'Filter',
  SEARCH: 'Search',
  EXPORT: 'Export',
  IMPORT: 'Import',
  
  // Trade Actions
  ADD_TRADE: 'Add Trade',
  EDIT_TRADE: 'Edit Trade',
  DELETE_TRADE: 'Delete Trade',
  CLOSE_TRADE: 'Close Trade',
  VIEW_TRADE: 'View Trade Details',
  CREATE_TRADE: 'Create Trade',
  UPDATE_TRADE: 'Update Trade',
  
  // Forms
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_NUMBER: 'Please enter a valid number',
  MUST_BE_POSITIVE: 'Value must be positive',
  MUST_BE_GREATER_THAN_ZERO: 'Value must be greater than zero',
  
  // Loading and Status
  LOADING: 'Loading...',
  LOADING_DASHBOARD: 'Loading dashboard...',
  LOADING_TRADES: 'Loading trades...',
  LOADING_ANALYTICS: 'Loading analytics...',
  SAVING: 'Saving...',
  CREATING: 'Creating...',
  UPDATING: 'Updating...',
  DELETING: 'Deleting...',
  PROCESSING: 'Processing...',
  
  // Errors
  ERROR: 'Error',
  ERROR_LOADING_DASHBOARD: 'Error Loading Dashboard',
  ERROR_LOADING_TRADES: 'Error Loading Trades',
  ERROR_CREATING_TRADE: 'Error Creating Trade',
  ERROR_UPDATING_TRADE: 'Error Updating Trade',
  ERROR_DELETING_TRADE: 'Error Deleting Trade',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  TRY_AGAIN: 'Try Again',
  NETWORK_ERROR: 'Network connection error',
  SERVER_ERROR: 'Server error occurred',
  
  // Success Messages
  SUCCESS: 'Success',
  TRADE_CREATED: 'Trade created successfully',
  TRADE_UPDATED: 'Trade updated successfully',
  TRADE_DELETED: 'Trade deleted successfully',
  TRADE_CLOSED: 'Trade closed successfully',
  
  // Confirmations
  CONFIRM: 'Confirm',
  CONFIRM_DELETE: 'Are you sure you want to delete this item?',
  CONFIRM_DELETE_TRADE: 'Are you sure you want to delete this trade?',
  CONFIRM_CLOSE_TRADE: 'Are you sure you want to close this trade?',
  DELETE_WARNING: 'This action cannot be undone.',
  CLOSE_TRADE_WARNING: 'Once closed, this trade cannot be reopened.',
  
  // Help and Guidance
  HELP: 'Help',
  HELP_MODE: 'Help Mode',
  NEED_HELP: 'Need Help?',
  START_TOUR: 'Start Tour',
  SKIP_TOUR: 'Skip Tour',
  PREVIOUS: 'Previous',
  NEXT: 'Next',
  FINISH: 'Finish',
  EXIT_HELP: 'Exit Help',
  HELP_MODE_ACTIVE: 'Help Mode Active',
  HOVER_FOR_TIPS: 'Hover over UI elements to see helpful tips and explanations.',
  
  // Help Content
  HELP_DASHBOARD: 'This is your main trading dashboard where you can see performance metrics and manage trades',
  HELP_ADD_TRADE: 'Click here to add a new trade to your journal. You can record entry details, position size, and notes.',
  HELP_REFRESH: 'Refresh your dashboard data. The data updates automatically when you make changes, but you can manually refresh if needed.',
  HELP_STATS_CARDS: 'These cards show your key trading metrics: total trades, profit/loss, win rate, and average win. They update automatically as you add trades.',
  HELP_RECENT_TRADES: 'Your most recent trades are displayed here. You can view details, close positions, edit, or delete trades from this list.',
  HELP_BUTTON_DESC: 'Click the help button to enter help mode, where you can hover over any element to see explanations. You can also restart this tour anytime!',
  
  // Onboarding
  WELCOME_TO_DASHBOARD: 'Welcome to Your Trading Dashboard',
  ONBOARDING_DASHBOARD: 'This is your main dashboard where you can see an overview of your trading performance and manage your trades.',
  ONBOARDING_STATS: 'These cards show your key trading statistics: total trades, P&L, win rate, and average win amount. They update automatically as you add new trades.',
  ONBOARDING_ADD_TRADE: 'Click here to record a new trade. You can add entry details, notes, and track your positions.',
  ONBOARDING_REFRESH: 'Use this button to refresh your dashboard data if needed. The data updates automatically when you add or modify trades.',
  ONBOARDING_TRADES_LIST: 'Your most recent trades are displayed here. You can view details, close positions, or delete trades from this list.',
  ONBOARDING_HELP: 'Click the help button to enter help mode, where you can hover over any element to see explanations. You can also restart this tour anytime!',
  
  // Placeholders
  PLACEHOLDER_SYMBOL: 'e.g., BTC/USDT',
  PLACEHOLDER_NOTES: 'Optional notes about this trade...',
  PLACEHOLDER_SEARCH: 'Search trades...',
  PLACEHOLDER_EMAIL: 'Enter your email',
  PLACEHOLDER_PASSWORD: 'Enter your password',
  
  // Time and Date
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  THIS_WEEK: 'This Week',
  THIS_MONTH: 'This Month',
  THIS_YEAR: 'This Year',
  LAST_7_DAYS: 'Last 7 Days',
  LAST_30_DAYS: 'Last 30 Days',
  LAST_90_DAYS: 'Last 90 Days',
  
  // Formats
  CURRENCY_USD: 'USD',
  PERCENTAGE: '%',
  NO_DATA: 'No data available',
  NO_TRADES: 'No trades found',
  
  // Keyboard Shortcuts
  KEYBOARD_SHORTCUTS: 'Keyboard Shortcuts',
  SHORTCUT_ADD_TRADE: 'Add New Trade',
  SHORTCUT_REFRESH: 'Refresh Data',
  SHORTCUT_HELP: 'Toggle Help Mode',
  SHORTCUT_SEARCH: 'Focus Search',
  
  // Accessibility
  CLOSE_MODAL: 'Close modal',
  OPEN_MENU: 'Open menu',
  SORT_BY: 'Sort by',
  ASCENDING: 'Ascending',
  DESCENDING: 'Descending',
  
  // Units
  UNITS_CURRENCY: '$',
  UNITS_PERCENTAGE: '%',
  UNITS_SHARES: 'shares',
  UNITS_CONTRACTS: 'contracts',
  
  // Time formats
  TIME_FORMAT_12H: '12-hour',
  TIME_FORMAT_24H: '24-hour',
  
  // Generic
  YES: 'Yes',
  NO: 'No',
  OK: 'OK',
  DONE: 'Done',
  CONTINUE: 'Continue',
  BACK: 'Back',
  SKIP: 'Skip',
  MORE: 'More',
  LESS: 'Less',
  ALL: 'All',
  NONE: 'None',
  OTHER: 'Other',
  UNKNOWN: 'Unknown',
  
  // Validation
  FIELD_REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  VALUE_TOO_LARGE: 'Value is too large',
  VALUE_TOO_SMALL: 'Value is too small',
} as const;

// Type for accessing string keys
export type StringKey = keyof typeof STRINGS;