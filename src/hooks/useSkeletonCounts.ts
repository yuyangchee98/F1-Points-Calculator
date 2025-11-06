import { SKELETON_CONFIG } from '../utils/constants';

interface SkeletonCounts {
  races: number;
  drivers: number;
  teams: number;
  year: number;
}

/**
 * Hook to get skeleton counts for loading states
 *
 * Strategy:
 * 1. Check localStorage for cached counts from previous session
 * 2. If cache exists and year matches, use cached values (100% accurate)
 * 3. Otherwise fall back to SKELETON_CONFIG constants (~95% accurate)
 *
 * Cache is automatically updated by seasonDataSlice after API loads
 */
export const useSkeletonCounts = (): SkeletonCounts => {
  try {
    const cached = localStorage.getItem('f1-skeleton-counts');

    if (cached) {
      const parsed: SkeletonCounts = JSON.parse(cached);

      // Validate that cache is from current season
      if (parsed.year === SKELETON_CONFIG.year) {
        return parsed;
      }
    }
  } catch (error) {
    // Invalid JSON or localStorage unavailable, fall through to defaults
    console.warn('Failed to load skeleton counts from cache:', error);
  }

  // Return constants as fallback
  return SKELETON_CONFIG;
};
