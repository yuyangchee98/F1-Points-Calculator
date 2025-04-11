// Points system for F1 races

// Regular race points for positions 1-20
export const POINTS_MAP: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
  17: 0,
  18: 0,
  19: 0,
  20: 0,
};

// Sprint race points for positions 1-20
export const SPRINT_POINTS_MAP: Record<number, number> = {
  1: 8,
  2: 7,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
  17: 0,
  18: 0,
  19: 0,
  20: 0,
};

// Points for fastest lap
export const FASTEST_LAP_POINT = 1;

// Function to get points for a given position and race type
export const getPointsForPosition = (position: number, isSprint: boolean): number => {
  if (isSprint) {
    return SPRINT_POINTS_MAP[position] || 0;
  }
  return POINTS_MAP[position] || 0;
};