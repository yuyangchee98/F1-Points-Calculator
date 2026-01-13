import { createAuthClient } from 'better-auth/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

// Types
export type Session = typeof authClient.$Infer.Session;
export type User = Session['user'];
