import { API_BASE_URL } from '../utils/constants';

interface DayAccessStatus {
  isActive: boolean;
  customerId?: string;
  purchaseTime?: number;
  expiresAt?: number;
}

interface CheckoutSession {
  sessionId: string;
  url: string;
}

export async function checkDayAccessStatus(email: string): Promise<DayAccessStatus> {
  const response = await fetch(`${API_BASE_URL}/api/subscription/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to check day access status');
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
      successUrl: `${window.location.origin}?payment=success`,
      cancelUrl: `${window.location.origin}?payment=cancelled`,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}

