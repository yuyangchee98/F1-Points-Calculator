// Use production URL for Stripe subscription
const API_BASE_URL = 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

interface SubscriptionStatus {
  isActive: boolean;
  customerId?: string;
  subscriptionId?: string;
  status?: string;
  currentPeriodEnd?: number;
}

interface CheckoutSession {
  sessionId: string;
  url: string;
}

export async function checkSubscriptionStatus(email: string): Promise<SubscriptionStatus> {
  const response = await fetch(`${API_BASE_URL}/api/subscription/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to check subscription status');
  }

  return response.json();
}

export async function createCheckoutSession(email: string): Promise<CheckoutSession> {
  const response = await fetch(`${API_BASE_URL}/api/subscription/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      successUrl: `${window.location.origin}?subscription=success`,
      cancelUrl: `${window.location.origin}?subscription=cancelled`,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}