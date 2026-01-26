import { useState, useEffect, useRef, useCallback } from 'react';
import { getConsensus, ConsensusData } from '../api/predictions';
import { getActiveSeason } from '../utils/constants';

// Global cache for consensus data per race
const consensusCache: Record<string, ConsensusData> = {};
const fetchingRaces: Set<string> = new Set();
// Listeners waiting for fetch to complete
const pendingListeners: Record<string, Set<(data: ConsensusData) => void>> = {};

export function useConsensus(raceId: string, enabled: boolean) {
  const [data, setData] = useState<ConsensusData | null>(consensusCache[raceId] || null);
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
    if (consensusCache[raceId]) {
      setData(consensusCache[raceId]);
      return;
    }

    // Already fetching - subscribe to get notified when done
    if (fetchingRaces.has(raceId)) {
      if (!pendingListeners[raceId]) {
        pendingListeners[raceId] = new Set();
      }
      pendingListeners[raceId].add(handleDataReceived);
      setLoading(true);

      return () => {
        pendingListeners[raceId]?.delete(handleDataReceived);
      };
    }

    const fetchData = async () => {
      fetchingRaces.add(raceId);
      setLoading(true);

      const result = await getConsensus(getActiveSeason(), raceId);

      if (result) {
        consensusCache[raceId] = result;
        if (mountedRef.current) {
          setData(result);
        }
        // Notify all waiting listeners
        pendingListeners[raceId]?.forEach(listener => listener(result));
        delete pendingListeners[raceId];
      }

      fetchingRaces.delete(raceId);
      if (mountedRef.current) {
        setLoading(false);
      }
    };

    fetchData();
  }, [raceId, enabled, handleDataReceived]);

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
