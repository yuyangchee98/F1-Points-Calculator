import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const AuthModal: React.FC = () => {
  const { showAuthModal, authModalMode, closeModal, signIn, signUp, resendVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Sync mode with authModalMode when modal opens
  React.useEffect(() => {
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

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

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
