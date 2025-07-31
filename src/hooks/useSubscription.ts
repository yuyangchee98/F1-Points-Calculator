import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { checkSubscriptionStatus } from '../api/subscription';

const SUBSCRIPTION_KEY = 'f1_smart_input_subscription';
const SUBSCRIPTION_CHECK_INTERVAL = 1000 * 60 * 60; // Check every hour

export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fingerprint = useSelector((state: RootState) => state.predictions.fingerprint);

  useEffect(() => {
    const checkStatus = async () => {
      if (!fingerprint) {
        setIsLoading(false);
        return;
      }

      try {
        // Check cached status first
        const cachedStatus = localStorage.getItem(SUBSCRIPTION_KEY);
        const lastCheck = localStorage.getItem(`${SUBSCRIPTION_KEY}_lastCheck`);
        const now = Date.now();

        if (cachedStatus && lastCheck) {
          const timeSinceLastCheck = now - parseInt(lastCheck);
          if (timeSinceLastCheck < SUBSCRIPTION_CHECK_INTERVAL) {
            setIsSubscribed(cachedStatus === 'active');
            setIsLoading(false);
            return;
          }
        }

        // Check with API
        const status = await checkSubscriptionStatus(fingerprint);
        const isActive = status.isActive;
        
        // Cache the result
        localStorage.setItem(SUBSCRIPTION_KEY, isActive ? 'active' : 'inactive');
        localStorage.setItem(`${SUBSCRIPTION_KEY}_lastCheck`, now.toString());
        
        setIsSubscribed(isActive);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        // Fall back to cached status if available
        const cachedStatus = localStorage.getItem(SUBSCRIPTION_KEY);
        setIsSubscribed(cachedStatus === 'active');
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();

    // Check for subscription parameter in URL (for redirect from Stripe)
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionParam = urlParams.get('subscription');
    
    if (subscriptionParam === 'success') {
      // Clear the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Re-check subscription status after a short delay
      setTimeout(() => {
        localStorage.removeItem(`${SUBSCRIPTION_KEY}_lastCheck`);
        checkStatus();
      }, 2000);
    }
  }, [fingerprint]);

  const refreshStatus = async () => {
    if (fingerprint) {
      localStorage.removeItem(`${SUBSCRIPTION_KEY}_lastCheck`);
      setIsLoading(true);
      
      try {
        const status = await checkSubscriptionStatus(fingerprint);
        const isActive = status.isActive;
        
        localStorage.setItem(SUBSCRIPTION_KEY, isActive ? 'active' : 'inactive');
        localStorage.setItem(`${SUBSCRIPTION_KEY}_lastCheck`, Date.now().toString());
        
        setIsSubscribed(isActive);
      } catch (error) {
        console.error('Error refreshing subscription status:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return { isSubscribed, isLoading, refreshStatus };
};