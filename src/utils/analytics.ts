declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const GA_EVENTS = {
  DRIVER_ACTIONS: {
    DRAG_START: 'drag_start',
    DROP_COMPLETE: 'drop_complete',
    SELECT_DRIVER: 'select_driver',
    CANCEL_SELECTION: 'cancel_driver_selection',
    TOGGLE_DRIVER_VISIBILITY: 'toggle_driver_visibility',
  },
  GRID_ACTIONS: {
    RESET_PREDICTIONS: 'reset_predictions',
    TOGGLE_OFFICIAL: 'toggle_official_results',
    CHANGE_POINTS_SYSTEM: 'change_points_system',
  },
  NAVIGATION: {
    VIEW_STANDINGS: 'view_standings',
    VIEW_CHARTS: 'view_charts',
    MOBILE_VIEW_CHANGE: 'mobile_view_change',
    TOGGLE_SIDEBAR: 'toggle_sidebar',
    STANDINGS_TAB_CHANGE: 'standings_tab_change',
  },
  ENGAGEMENT: {
    BUY_COFFEE_CLICK: 'buy_coffee_click',
    SESSION_DURATION: 'session_duration',
    PREDICTIONS_COMPLETED: 'predictions_completed',
    FEEDBACK_CLICK: 'feedback_click',
  },
  VERSION_HISTORY: {
    OPEN_HISTORY: 'open_version_history',
    LOAD_VERSION: 'load_version',
    DELETE_ALL_VERSIONS: 'delete_all_versions',
    CLOSE_HISTORY: 'close_version_history',
  },
  INFO_ACTIONS: {
    TOGGLE_HOW_TO_USE: 'toggle_how_to_use',
    TOGGLE_POINTS_REFERENCE: 'toggle_points_reference',
    TOGGLE_INTRO_SECTION: 'toggle_intro_section',
    TOGGLE_FAQ: 'toggle_faq_question',
  },
  UI_ACTIONS: {
    CLOSE_TOAST: 'close_toast',
    SCROLL_HORIZONTAL: 'horizontal_scroll',
    DROPDOWN_TOGGLE: 'dropdown_toggle',
  },
  SMART_INPUT: {
    VIEW_FEATURE: 'smart_input_view',
    CLICK_TRY_NOW: 'smart_input_try_now',
    CONFIRM_SUBSCRIPTION: 'smart_input_confirm_subscription',
    CONFIRM_ACCESS: 'smart_input_confirm_access',
    OPEN_SUBSCRIPTION_MODAL: 'smart_input_open_modal',
    CLOSE_SUBSCRIPTION_MODAL: 'smart_input_close_modal',
    CLICK_SUBSCRIBE: 'smart_input_subscribe_click',
    SUBSCRIPTION_SUCCESS: 'smart_input_subscription_success',
    SUBSCRIPTION_CANCEL: 'smart_input_subscription_cancel',
    PAYMENT_SUCCESS: 'smart_input_payment_success',
    PAYMENT_CANCEL: 'smart_input_payment_cancel',
    ENTER_EMAIL: 'smart_input_enter_email',
    USE_COMMAND: 'smart_input_use_command',
    COMMAND_SUCCESS: 'smart_input_command_success',
    COMMAND_FAIL: 'smart_input_command_fail',
    MANAGE_SUBSCRIPTION: 'smart_input_manage_subscription',
  },
  CONTEXT_MENU: {
    OPEN: 'context_menu_open',
    CLOSE: 'context_menu_close',
    ACTION: 'context_menu_action',
  },
} as const;

export const trackDriverDrop = (
  driverId: string,
  raceId: string,
  position: number
) => {
  trackEvent(
    GA_EVENTS.DRIVER_ACTIONS.DROP_COMPLETE,
    'Driver Predictions',
    `${driverId}_to_${raceId}_P${position}`,
    position
  );
};

export const trackPointsSystemChange = (system: string) => {
  trackEvent(
    GA_EVENTS.GRID_ACTIONS.CHANGE_POINTS_SYSTEM,
    'Settings',
    system
  );
};

export const trackMobileViewChange = (view: string) => {
  trackEvent(
    GA_EVENTS.NAVIGATION.MOBILE_VIEW_CHANGE,
    'Navigation',
    view
  );
};

export const trackBuyCoffeeClick = () => {
  trackEvent(
    GA_EVENTS.ENGAGEMENT.BUY_COFFEE_CLICK,
    'Engagement',
    'header_button'
  );
};

export const trackFeedbackClick = () => {
  trackEvent(
    GA_EVENTS.ENGAGEMENT.FEEDBACK_CLICK,
    'Engagement',
    'github_issues'
  );
};

export const trackSidebarToggle = (isOpen: boolean) => {
  trackEvent(
    GA_EVENTS.NAVIGATION.TOGGLE_SIDEBAR,
    'Navigation',
    isOpen ? 'open' : 'close'
  );
};

export const trackStandingsTabChange = (tab: 'tables' | 'charts') => {
  trackEvent(
    GA_EVENTS.NAVIGATION.STANDINGS_TAB_CHANGE,
    'Navigation',
    tab
  );
};

export const trackVersionHistoryAction = (action: keyof typeof GA_EVENTS.VERSION_HISTORY, details?: string) => {
  trackEvent(
    GA_EVENTS.VERSION_HISTORY[action],
    'Version History',
    details
  );
};

export const trackInfoToggle = (type: keyof typeof GA_EVENTS.INFO_ACTIONS, isOpen: boolean, details?: string) => {
  trackEvent(
    GA_EVENTS.INFO_ACTIONS[type],
    'Info Actions',
    details || (isOpen ? 'open' : 'close')
  );
};

export const trackUIAction = (action: keyof typeof GA_EVENTS.UI_ACTIONS, details?: string) => {
  trackEvent(
    GA_EVENTS.UI_ACTIONS[action],
    'UI Actions',
    details
  );
};

export const trackSmartInputAction = (action: keyof typeof GA_EVENTS.SMART_INPUT, details?: string, value?: number) => {
  trackEvent(
    GA_EVENTS.SMART_INPUT[action],
    'Smart Input',
    details,
    value
  );
};

export const trackSmartInputCommand = (command: string, success: boolean, placementCount?: number) => {
  trackEvent(
    success ? GA_EVENTS.SMART_INPUT.COMMAND_SUCCESS : GA_EVENTS.SMART_INPUT.COMMAND_FAIL,
    'Smart Input',
    command.substring(0, 50), // Truncate long commands
    placementCount
  );
};

export const trackContextMenuAction = (action: keyof typeof GA_EVENTS.CONTEXT_MENU, details?: string, value?: number) => {
  trackEvent(
    GA_EVENTS.CONTEXT_MENU[action],
    'Context Menu',
    details,
    value
  );
};

// User Properties - track user characteristics for segmentation
export const updateUserProperties = (properties: {
  total_predictions?: number;
  completion_rate?: number;
  has_paid?: boolean;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

// Track prediction count
const PREDICTIONS_COUNT_KEY = 'f1_predictions_count';

export const incrementPredictionCount = () => {
  const count = parseInt(localStorage.getItem(PREDICTIONS_COUNT_KEY) || '0', 10);
  const newCount = count + 1;
  localStorage.setItem(PREDICTIONS_COUNT_KEY, newCount.toString());
  return newCount;
};

export const getPredictionCount = (): number => {
  return parseInt(localStorage.getItem(PREDICTIONS_COUNT_KEY) || '0', 10);
};