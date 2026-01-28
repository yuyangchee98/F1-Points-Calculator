import { useState, useEffect } from 'react';
import { checkAccessStatus, AccessTier } from '../api/subscription';
import { useUserEmail } from './useUserEmail';
import { updateUserProperties } from '../utils/analytics';

const ACCESS_KEY = 'f1_consensus_access';
const ACCESS_CHECK_INTERVAL = 1000 * 60 * 10; // Check every 10 minutes

export const useConsensusAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [tier, setTier] = useState<AccessTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const { email } = useUserEmail();

  useEffect(() => {
    const checkStatus = async () => {
      if (!email) {
        setIsLoading(false);
        setHasAccess(false);
        return;
      }

      try {
        const cacheKey = `${ACCESS_KEY}_${email}`;
        const cachedStatus = localStorage.getItem(cacheKey);
        const cachedTier = localStorage.getItem(`${cacheKey}_tier`) as AccessTier | null;
        const lastCheck = localStorage.getItem(`${cacheKey}_lastCheck`);
        const now = Date.now();

        if (cachedStatus && lastCheck) {
          const timeSinceLastCheck = now - parseInt(lastCheck);
          if (timeSinceLastCheck < ACCESS_CHECK_INTERVAL) {
            setHasAccess(cachedStatus === 'active');
            setTier(cachedTier);
            setIsLoading(false);
            return;
          }
        }

        const status = await checkAccessStatus(email);
        const isActive = status.isActive;

        localStorage.setItem(cacheKey, isActive ? 'active' : 'inactive');
        localStorage.setItem(`${cacheKey}_lastCheck`, now.toString());
        if (status.tier) {
          localStorage.setItem(`${cacheKey}_tier`, status.tier);
        }

        setHasAccess(isActive);
        setTier(status.tier || null);
      } catch (error) {
        const cacheKey = `${ACCESS_KEY}_${email}`;
        const cachedStatus = localStorage.getItem(cacheKey);
        setHasAccess(cachedStatus === 'active');
      } finally {
        setIsLoading(false);
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const paymentParam = urlParams.get('payment');

    if (paymentParam === 'success') {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: `T_${Date.now()}_${email || 'unknown'}`,
          value: 15,
          currency: 'USD',
          items: [{
            item_id: 'consensus_access',
            item_name: 'Consensus Access',
            price: 15,
            quantity: 1
          }]
        });
      }

      updateUserProperties({ has_paid: true });

      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(ACCESS_KEY)) {
          localStorage.removeItem(key);
        }
      });

      window.history.replaceState({}, document.title, window.location.pathname);

      if (email) {
        setStatusMessage('Payment successful! Consensus access granted.');
        setTimeout(() => setStatusMessage(''), 3000);
        checkStatus();
      }
    } else if (paymentParam === 'cancelled') {
      window.history.replaceState({}, document.title, window.location.pathname);
      checkStatus();
    } else {
      checkStatus();
    }
  }, [email]);

  const refreshStatus = async () => {
    if (email) {
      const cacheKey = `${ACCESS_KEY}_${email}`;
      localStorage.removeItem(`${cacheKey}_lastCheck`);
      setIsLoading(true);

      try {
        const status = await checkAccessStatus(email);
        const isActive = status.isActive;

        localStorage.setItem(cacheKey, isActive ? 'active' : 'inactive');
        localStorage.setItem(`${cacheKey}_lastCheck`, Date.now().toString());
        if (status.tier) {
          localStorage.setItem(`${cacheKey}_tier`, status.tier);
        }

        setHasAccess(isActive);
        setTier(status.tier || null);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
  };

  return { hasAccess, tier, isLoading, refreshStatus, statusMessage };
};

// Keep old export for backward compatibility during migration
export const useDayAccess = useConsensusAccess;
