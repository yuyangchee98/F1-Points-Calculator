import { useState, useEffect } from 'react';
import { checkDayAccessStatus } from '../api/subscription';
import { useUserEmail } from './useUserEmail';
import { updateUserProperties } from '../utils/analytics';

const ACCESS_KEY = 'f1_smart_input_access';
const ACCESS_CHECK_INTERVAL = 1000 * 60 * 10; // Check every 10 minutes

export const useDayAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
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
        const lastCheck = localStorage.getItem(`${cacheKey}_lastCheck`);
        const now = Date.now();

        if (cachedStatus && lastCheck) {
          const timeSinceLastCheck = now - parseInt(lastCheck);
          if (timeSinceLastCheck < ACCESS_CHECK_INTERVAL) {
            setHasAccess(cachedStatus === 'active');
            setIsLoading(false);
            return;
          }
        }

        const status = await checkDayAccessStatus(email);
        const isActive = status.isActive;

        localStorage.setItem(cacheKey, isActive ? 'active' : 'inactive');
        localStorage.setItem(`${cacheKey}_lastCheck`, now.toString());

        setHasAccess(isActive);
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
          value: 0.99,
          currency: 'USD',
          items: [{
            item_id: 'smart_input_24hr',
            item_name: 'Smart Input 24hr Access',
            price: 0.99,
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
        setStatusMessage('🎉 Payment successful! Access granted for 24 hours.');
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
        const status = await checkDayAccessStatus(email);
        const isActive = status.isActive;

        localStorage.setItem(cacheKey, isActive ? 'active' : 'inactive');
        localStorage.setItem(`${cacheKey}_lastCheck`, Date.now().toString());

        setHasAccess(isActive);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
  };

  return { hasAccess, isLoading, refreshStatus, statusMessage };
};