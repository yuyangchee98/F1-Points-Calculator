import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSession, signIn, signUp, signOut, sendVerificationEmail } from '../lib/auth-client';
import { RootState, useAppDispatch } from '../store';
import { setUser, setLoading, openAuthModal, closeAuthModal, logout } from '../store/slices/authSlice';
import { API_BASE_URL } from '../utils/constants';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isLoading, isAuthenticated, showAuthModal, authModalMode } = useSelector(
    (state: RootState) => state.auth
  );

  // Sync Better Auth session with Redux
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) {
      dispatch(setLoading(true));
      return;
    }

    if (session?.user) {
      dispatch(setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        emailVerified: session.user.emailVerified ?? false,
      }));
    } else {
      dispatch(setUser(null));
    }
  }, [session, isPending, dispatch]);

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn.email({ email, password });
    if (result.error) {
      throw new Error(result.error.message);
    }
    dispatch(closeAuthModal());
    return result;
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    const result = await signUp.email({ email, password, name, callbackURL: window.location.origin });
    if (result.error) {
      throw new Error(result.error.message);
    }
    // Don't close modal - let AuthModal show verification message
    return { ...result, needsVerification: true };
  };

  const handleResendVerification = async (email: string) => {
    const result = await sendVerificationEmail({ email, callbackURL: window.location.origin });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    dispatch(logout());
  };

  const handleGoogleSignIn = () => {
    const callbackURL = encodeURIComponent(window.location.href);
    const errorCallbackURL = encodeURIComponent(window.location.href + '?auth_error=true');
    window.location.href = `${API_BASE_URL}/api/auth/social-redirect?provider=google&callbackURL=${callbackURL}&errorCallbackURL=${errorCallbackURL}`;
  };

  const openSignIn = () => dispatch(openAuthModal('signin'));
  const openSignUp = () => dispatch(openAuthModal('signup'));
  const closeModal = () => dispatch(closeAuthModal());

  return {
    user,
    isLoading,
    isAuthenticated,
    showAuthModal,
    authModalMode,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    signInWithGoogle: handleGoogleSignIn,
    resendVerification: handleResendVerification,
    openSignIn,
    openSignUp,
    closeModal,
  };
}
