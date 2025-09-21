import { useState, useEffect } from 'react';
import { checkDayAccessStatus } from '../api/subscription';
import { useUserEmail } from './useUserEmail';
import { trackSmartInputAction } from '../utils/analytics';

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
        setIsSubscribed(false);
        return;
      }

      try {
        // Check cached status first for this email
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

        // Check with API
        const status = await checkDayAccessStatus(email);
        const isActive = status.isActive;

        // Cache the result for this email
        localStorage.setItem(cacheKey, isActive ? 'active' : 'inactive');
        localStorage.setItem(`${cacheKey}_lastCheck`, now.toString());

        setHasAccess(isActive);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        // Fall back to cached status if available
        const cacheKey = `${ACCESS_KEY}_${email}`;
        const cachedStatus = localStorage.getItem(cacheKey);
        setHasAccess(cachedStatus === 'active');
      } finally {
        setIsLoading(false);
      }
    };

    // Check for payment parameter in URL BEFORE checking status
    const urlParams = new URLSearchParams(window.location.search);
    const paymentParam = urlParams.get('payment');

    if (paymentParam === 'success') {
      trackSmartInputAction('PAYMENT_SUCCESS', email || 'unknown');

      // Clear ALL cached access data for ALL emails
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(ACCESS_KEY)) {
          localStorage.removeItem(key);
        }
      });

      // Clear the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Show success message and check status
      if (email) {
        setStatusMessage('🎉 Payment successful! Access granted for 24 hours.');
        setTimeout(() => setStatusMessage(''), 3000);
        checkStatus();
      }
    } else if (paymentParam === 'cancelled') {
      trackSmartInputAction('PAYMENT_CANCEL', email || 'unknown');
      // Clear the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      checkStatus();
    } else {
      // Normal status check
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
        console.error('Error refreshing access status:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return { hasAccess, isLoading, refreshStatus, statusMessage };
};