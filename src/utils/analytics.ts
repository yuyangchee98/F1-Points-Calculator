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
    DROP_COMPLETE: 'drop_complete',
    CANCEL_SELECTION: 'cancel_driver_selection',
    TOGGLE_DRIVER_VISIBILITY: 'toggle_driver_visibility',
  },
  GRID_ACTIONS: {
    RESET_PREDICTIONS: 'reset_predictions',
    TOGGLE_OFFICIAL: 'toggle_official_results',
    CHANGE_POINTS_SYSTEM: 'change_points_system',
  },
  ENGAGEMENT: {
    BUY_COFFEE_CLICK: 'buy_coffee_click',
    FEEDBACK_CLICK: 'feedback_click',
  },
  VERSION_HISTORY: {
    OPEN_HISTORY: 'open_version_history',
    LOAD_VERSION: 'load_version',
    DELETE_ALL_VERSIONS: 'delete_all_versions',
    CLOSE_HISTORY: 'close_version_history',
  },
  SMART_INPUT: {
    CLICK_TRY_NOW: 'smart_input_try_now',
    OPEN_SUBSCRIPTION_MODAL: 'smart_input_open_modal',
    CLOSE_SUBSCRIPTION_MODAL: 'smart_input_close_modal',
    CLICK_SUBSCRIBE: 'smart_input_subscribe_click',
    ENTER_EMAIL: 'smart_input_enter_email',
    USE_COMMAND: 'smart_input_use_command',
    COMMAND_SUCCESS: 'smart_input_command_success',
    COMMAND_FAIL: 'smart_input_command_fail',
  },
  CONTEXT_MENU: {
    ACTION: 'context_menu_action',
  },
  EXPORT: {
    OPEN_MODAL: 'export_open_modal',
    CHANGE_FORMAT: 'export_change_format',
    GENERATE_SUCCESS: 'export_success',
    GENERATE_FAIL: 'export_fail',
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

export const trackVersionHistoryAction = (action: keyof typeof GA_EVENTS.VERSION_HISTORY, details?: string) => {
  trackEvent(
    GA_EVENTS.VERSION_HISTORY[action],
    'Version History',
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

export const trackExportAction = (action: keyof typeof GA_EVENTS.EXPORT, details?: string, value?: number) => {
  trackEvent(
    GA_EVENTS.EXPORT[action],
    'Export',
    details,
    value
  );
};

export const updateUserProperties = (properties: {
  total_predictions?: number;
  completion_rate?: number;
  has_paid?: boolean;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

const PREDICTIONS_COUNT_KEY = 'f1_predictions_count';

export const incrementPredictionCount = () => {
  const count = parseInt(localStorage.getItem(PREDICTIONS_COUNT_KEY) || '0', 10);
  const newCount = count + 1;
  localStorage.setItem(PREDICTIONS_COUNT_KEY, newCount.toString());
  return newCount;
};