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
  },
  ENGAGEMENT: {
    BUY_COFFEE_CLICK: 'buy_coffee_click',
    SESSION_DURATION: 'session_duration',
    PREDICTIONS_COMPLETED: 'predictions_completed',
    FEEDBACK_CLICK: 'feedback_click',
  },
} as const;

export const trackDriverDrop = (
  driverId: string,
  raceId: string,
  position: number,
  _fromPosition?: number
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