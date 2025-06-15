import { useState, useEffect } from 'react';

export type AnimationState = 'up' | 'down' | 'none';

interface StandingItem {
  position: number;
}

interface UseStandingsAnimationOptions<T> {
  getItemId: (item: T) => string;
  compareItems?: (current: T, previous: T) => boolean;
  animationDuration?: number;
}

export function useStandingsAnimation<T extends StandingItem>(
  standings: T[],
  options: UseStandingsAnimationOptions<T>
) {
  const { 
    getItemId, 
    compareItems = (current, prev) => getItemId(current) === getItemId(prev),
    animationDuration = 1000 
  } = options;

  const [prevStandings, setPrevStandings] = useState<T[]>([]);
  const [animatedItems, setAnimatedItems] = useState<Record<string, AnimationState>>({});

  useEffect(() => {
    if (standings.length > 0 && prevStandings.length > 0) {
      const animations: Record<string, AnimationState> = {};

      standings.forEach(standing => {
        const itemId = getItemId(standing);
        const prevStanding = prevStandings.find(ps => compareItems(standing, ps));

        if (prevStanding) {
          if (prevStanding.position > standing.position) {
            animations[itemId] = 'up';
          } else if (prevStanding.position < standing.position) {
            animations[itemId] = 'down';
          } else {
            animations[itemId] = 'none';
          }
        } else {
          animations[itemId] = 'none';
        }
      });

      setAnimatedItems(animations);

      const timer = setTimeout(() => {
        setAnimatedItems({});
      }, animationDuration);

      return () => clearTimeout(timer);
    }

    setPrevStandings(standings);
  }, [standings, prevStandings, getItemId, compareItems, animationDuration]);

  return animatedItems;
}