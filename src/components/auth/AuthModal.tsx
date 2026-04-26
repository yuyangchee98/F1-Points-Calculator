import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

// Google Icon SVG component
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AuthModal: React.FC = () => {
  const { showAuthModal, authModalMode, closeModal, signIn, signUp, signInWithGoogle, resendVerification, openSignIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Check for OAuth error in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    const errorMessage = params.get('error');

    if (authError || errorMessage) {
      setError(errorMessage || 'Authentication failed. Please try again.');
      openSignIn(); // Open the modal to show the error
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('auth_error');
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [openSignIn]);

  // Sync mode with authModalMode when modal opens
  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setVerificationSent(false);
    setVerificationEmail('');
  }, [authModalMode, showAuthModal]);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        const result = await signUp(email, password, name);
        if (result.needsVerification) {
          setVerificationEmail(email);
          setVerificationSent(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await resendVerification(verificationEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // OAuth redirects away, so this won't run unless there's an error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  // Verification sent screen
  if (verificationSent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to<br />
              <span className="font-medium text-gray-900">{verificationEmail}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in the email to verify your account. The link expires in 1 hour.
            </p>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Resend verification email'}
              </button>
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === 'signin'
              ? 'Welcome back! Sign in to sync your predictions.'
              : 'Create an account to save predictions across devices.'}
          </p>
        </div>

        {/* Error display - shown for both OAuth and form errors */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon className="w-5 h-5" />
          <span className="font-medium text-gray-700">
            {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
          </span>
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
              minLength={8}
            />
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-md transition font-semibold ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isLoading
                ? 'Loading...'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={toggleMode}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={toggleMode}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
