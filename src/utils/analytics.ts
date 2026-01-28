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
  SUBSCRIPTION: {
    OPEN_MODAL: 'subscription_open_modal',
    CLOSE_MODAL: 'subscription_close_modal',
    CLICK_SUBSCRIBE: 'subscription_subscribe_click',
    PURCHASE_SUCCESS: 'subscription_purchase_success',
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

export const trackSubscriptionAction = (action: keyof typeof GA_EVENTS.SUBSCRIPTION, details?: string, value?: number) => {
  trackEvent(
    GA_EVENTS.SUBSCRIPTION[action],
    'Subscription',
    details,
    value
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