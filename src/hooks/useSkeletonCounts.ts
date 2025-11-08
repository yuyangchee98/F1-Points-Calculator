import { SKELETON_CONFIG } from '../utils/constants';

interface SkeletonCounts {
  races: number;
  drivers: number;
  teams: number;
  year: number;
}

export const useSkeletonCounts = (): SkeletonCounts => {
  try {
    const cached = localStorage.getItem('f1-skeleton-counts');

    if (cached) {
      const parsed: SkeletonCounts = JSON.parse(cached);

      if (parsed.year === SKELETON_CONFIG.year) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load skeleton counts from cache:', error);
  }

  return SKELETON_CONFIG;
};
