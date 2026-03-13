import { createAuthClient } from 'better-auth/react';

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
});

// Export typed hooks
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  sendVerificationEmail,
} = authClient;

