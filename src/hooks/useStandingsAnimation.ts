import { useState, useEffect, useRef } from 'react';

export type AnimationState = 'up' | 'down' | 'none';

interface StandingItem {
  position: number;
  points: number;
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
    animationDuration = 1000 
  } = options;

  const prevStandingsRef = useRef<T[]>([]);
  const optionsRef = useRef(options);
  const [animatedItems, setAnimatedItems] = useState<Record<string, AnimationState>>({});

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const prevStandings = prevStandingsRef.current;
    const { getItemId: getId, compareItems: compare } = optionsRef.current;
    const compareItemsFn = compare || ((current, prev) => getId(current) === getId(prev));

    const standingsKey = JSON.stringify(standings.map(s => ({
      id: getId(s),
      position: s.position,
      points: s.points
    })));
    
    const prevStandingsKey = JSON.stringify(prevStandings.map(s => ({
      id: getId(s),
      position: s.position,
      points: s.points
    })));
    
    const standingsChanged = standingsKey !== prevStandingsKey;
    
    if (standings.length > 0 && prevStandings.length > 0 && standingsChanged) {
      const animations: Record<string, AnimationState> = {};
      let hasChanges = false;

      standings.forEach(standing => {
        const itemId = getId(standing);
        const prevStanding = prevStandings.find(ps => compareItemsFn(standing, ps));

        if (prevStanding) {
          if (prevStanding.position > standing.position) {
            animations[itemId] = 'up';
            hasChanges = true;
          } else if (prevStanding.position < standing.position) {
            animations[itemId] = 'down';
            hasChanges = true;
          } else {
            animations[itemId] = 'none';
          }
        } else {
          animations[itemId] = 'none';
        }
      });

      if (hasChanges) {
        setAnimatedItems(animations);

        const timer = setTimeout(() => {
          setAnimatedItems({});
        }, animationDuration);

        return () => clearTimeout(timer);
      }
    }

    if (standingsChanged || prevStandings.length === 0) {
      prevStandingsRef.current = [...standings];
    }
  }, [standings, animationDuration]);

  return animatedItems;
}