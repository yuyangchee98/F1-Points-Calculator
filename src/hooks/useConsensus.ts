import { useState, useEffect, useRef, useCallback } from 'react';
import { getConsensus, type ConsensusData } from '../api/predictions';
import { getActiveSeason } from '../utils/constants';

// Global cache for consensus data per race
const consensusCache: Record<string, ConsensusData> = {};
const fetchingRaces: Set<string> = new Set();
// Listeners waiting for fetch to complete
const pendingListeners: Record<string, Set<(data: ConsensusData) => void>> = {};

export function useConsensus(raceId: string, enabled: boolean) {
  const season = getActiveSeason();
  const cacheKey = `${season}:${raceId}`;
  const [data, setData] = useState<ConsensusData | null>(consensusCache[cacheKey] || null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const handleDataReceived = useCallback((result: ConsensusData) => {
    if (mountedRef.current) {
      setData(result);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Already cached
    if (consensusCache[cacheKey]) {
      setData(consensusCache[cacheKey]);
      return;
    }

    // Already fetching - subscribe to get notified when done
    if (fetchingRaces.has(cacheKey)) {
      if (!pendingListeners[cacheKey]) {
        pendingListeners[cacheKey] = new Set();
      }
      pendingListeners[cacheKey].add(handleDataReceived);
      setLoading(true);

      return () => {
        pendingListeners[cacheKey]?.delete(handleDataReceived);
      };
    }

    const fetchData = async () => {
      fetchingRaces.add(cacheKey);
      setLoading(true);

      const result = await getConsensus(season, raceId);

      if (result) {
        consensusCache[cacheKey] = result;
        if (mountedRef.current) {
          setData(result);
        }
        // Notify all waiting listeners
        pendingListeners[cacheKey]?.forEach(listener => listener(result));
        delete pendingListeners[cacheKey];
      }

      fetchingRaces.delete(cacheKey);
      if (mountedRef.current) {
        setLoading(false);
      }
    };

    fetchData();
  }, [cacheKey, raceId, season, enabled, handleDataReceived]);

  return { data, loading };
}

// Get top driver for a specific position
export function getTopConsensusDriver(
  data: ConsensusData | null,
  position: number
): { driverId: string; percentage: number } | null {
  if (!data?.positions?.[position]?.[0]) return null;

  const top = data.positions[position][0];
  return {
    driverId: top.driverId,
    percentage: top.percentage,
  };
}
