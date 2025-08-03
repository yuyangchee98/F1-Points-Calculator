import { useState, useEffect } from 'react';
import { checkSubscriptionStatus } from '../api/subscription';
import { useUserEmail } from './useUserEmail';
import { trackSmartInputAction } from '../utils/analytics';

const SUBSCRIPTION_KEY = 'f1_smart_input_subscription';
const SUBSCRIPTION_CHECK_INTERVAL = 1000 * 60 * 60; // Check every hour

export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationMessage, setVerificationMessage] = useState('');
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
        const cacheKey = `${SUBSCRIPTION_KEY}_${email}`;
        const cachedStatus = localStorage.getItem(cacheKey);
        const lastCheck = localStorage.getItem(`${cacheKey}_lastCheck`);
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
        const status = await checkSubscriptionStatus(email);
        const isActive = status.isActive;
        
        // Cache the result for this email
        localStorage.setItem(cacheKey, isActive ? 'active' : 'inactive');
        localStorage.setItem(`${cacheKey}_lastCheck`, now.toString());
        
        setIsSubscribed(isActive);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        // Fall back to cached status if available
        const cacheKey = `${SUBSCRIPTION_KEY}_${email}`;
        const cachedStatus = localStorage.getItem(cacheKey);
        setIsSubscribed(cachedStatus === 'active');
      } finally {
        setIsLoading(false);
      }
    };

    // Check for subscription parameter in URL BEFORE checking status
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionParam = urlParams.get('subscription');
    
    if (subscriptionParam === 'success') {
      trackSmartInputAction('SUBSCRIPTION_SUCCESS', email || 'unknown');
      
      // Clear ALL cached subscription data for ALL emails
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(SUBSCRIPTION_KEY)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show verification message and wait before checking
      if (email) {
        setIsLoading(true);
        setVerificationMessage('🎉 Payment successful! Verifying your subscription...');
        
        // Wait 5 seconds to let Stripe process
        setTimeout(() => {
          setVerificationMessage('Almost there, finalizing your access...');
          
          let retries = 0;
          const maxRetries = 3;
          
          const checkWithRetry = async () => {
            try {
              const status = await checkSubscriptionStatus(email);
              if (status.isActive) {
                setIsSubscribed(true);
                setIsLoading(false);
                setVerificationMessage('');
                
                // Cache the result
                const cacheKey = `${SUBSCRIPTION_KEY}_${email}`;
                localStorage.setItem(cacheKey, 'active');
                localStorage.setItem(`${cacheKey}_lastCheck`, Date.now().toString());
              } else if (retries >= maxRetries) {
                setIsLoading(false);
                setVerificationMessage('');
                // Show a helpful message
                alert('Subscription is still processing. Please click "Try Now" in a moment to refresh.');
              } else {
                // Retry after a delay
                retries++;
                setVerificationMessage(`Checking subscription status... (${retries}/${maxRetries})`);
                setTimeout(checkWithRetry, 3000);
              }
            } catch (error) {
              console.error('Error checking subscription after success:', error);
              if (retries < maxRetries) {
                retries++;
                setTimeout(checkWithRetry, 3000);
              } else {
                setIsLoading(false);
                setVerificationMessage('');
                alert('Unable to verify subscription. Please try refreshing the page.');
              }
            }
          };
          
          checkWithRetry();
        }, 5000); // Wait 5 seconds before first check
      }
    } else if (subscriptionParam === 'cancelled') {
      trackSmartInputAction('SUBSCRIPTION_CANCEL', email || 'unknown');
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
      const cacheKey = `${SUBSCRIPTION_KEY}_${email}`;
      localStorage.removeItem(`${cacheKey}_lastCheck`);
      setIsLoading(true);
      
      try {
        const status = await checkSubscriptionStatus(email);
        const isActive = status.isActive;
        
        localStorage.setItem(cacheKey, isActive ? 'active' : 'inactive');
        localStorage.setItem(`${cacheKey}_lastCheck`, Date.now().toString());
        
        setIsSubscribed(isActive);
      } catch (error) {
        console.error('Error refreshing subscription status:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return { isSubscribed, isLoading, refreshStatus, verificationMessage };
};