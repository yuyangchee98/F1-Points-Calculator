import { API_BASE_URL } from '../utils/constants';

export type AccessTier = 'week' | 'season';

interface AccessStatus {
  isActive: boolean;
  tier?: AccessTier;
  purchaseTime?: number;
  expiresAt?: number;
}

interface CheckoutSession {
  sessionId: string;
  url: string;
}

export async function checkAccessStatus(email: string): Promise<AccessStatus> {
  const response = await fetch(`${API_BASE_URL}/api/subscription/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to check access status');
  }

  return response.json();
}

export async function createCheckoutSession(
  email: string,
  tier: AccessTier
): Promise<CheckoutSession> {
  const response = await fetch(`${API_BASE_URL}/api/subscription/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      tier,
      successUrl: `${window.location.origin}?payment=success`,
      cancelUrl: `${window.location.origin}?payment=cancelled`,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}

export async function openCustomerPortal(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/subscription/portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      returnUrl: window.location.href,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to open customer portal');
  }

  const { url } = await response.json();
  window.location.href = url;
}
