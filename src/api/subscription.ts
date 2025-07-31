// Hardcoded to local for testing
const API_BASE_URL = 'http://localhost:8787';

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

export async function checkSubscriptionStatus(fingerprint: string): Promise<SubscriptionStatus> {
  const response = await fetch(`${API_BASE_URL}/api/subscription/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fingerprint }),
  });

  if (!response.ok) {
    throw new Error('Failed to check subscription status');
  }

  return response.json();
}

export async function createCheckoutSession(fingerprint: string, email?: string): Promise<CheckoutSession> {
  const response = await fetch(`${API_BASE_URL}/api/subscription/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fingerprint,
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