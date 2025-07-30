import { useState, useEffect } from 'react';

const SUBSCRIPTION_KEY = 'f1_smart_input_subscription';

export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check localStorage for subscription status
    const subscriptionStatus = localStorage.getItem(SUBSCRIPTION_KEY);
    setIsSubscribed(subscriptionStatus === 'paid');
  }, []);

  const setSubscriptionStatus = (status: boolean) => {
    localStorage.setItem(SUBSCRIPTION_KEY, status ? 'paid' : 'unpaid');
    setIsSubscribed(status);
  };

  return { isSubscribed, setSubscriptionStatus };
};