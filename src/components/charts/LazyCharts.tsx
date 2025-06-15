import { lazy } from 'react';

// Lazy load chart components - they're heavy due to Chart.js
export const DriverPointsChart = lazy(() => import('./DriverPointsChart'));
export const TeamPointsChart = lazy(() => import('./TeamPointsChart'));