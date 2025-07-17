declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      config?: Record<string, string | number | boolean | undefined>
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