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
  },
  GRID_ACTIONS: {
    RESET_PREDICTIONS: 'reset_predictions',
    CHANGE_POINTS_SYSTEM: 'change_points_system',
    TOGGLE_CONSENSUS: 'toggle_consensus',
    GRID_COMPLETE: 'grid_complete',
  },
  EXPORT: {
    GENERATE_SUCCESS: 'export_success',
    GENERATE_FAIL: 'export_fail',
  },
  VERSION_HISTORY: {
    LOAD_VERSION: 'load_version',
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
