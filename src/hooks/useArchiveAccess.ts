import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { API_BASE_URL } from '../utils/constants';

interface ArchiveAccessState {
  isLoading: boolean;
  hasAccess: boolean;
  expiresAt: number | null;
}

const initial: ArchiveAccessState = {
  isLoading: false,
  hasAccess: false,
  expiresAt: null,
};

export function useArchiveAccess(): ArchiveAccessState {
  const user = useSelector((s: RootState) => s.auth.user);
  const email = user?.email;
  const [state, setState] = useState<ArchiveAccessState>(initial);

  useEffect(() => {
    if (!email) {
      setState(initial);
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, isLoading: true }));
    fetch(`${API_BASE_URL}/api/subscription/check`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { isActive?: boolean; tier?: string; expiresAt?: number } | null) => {
        if (cancelled) return;
        const hasAccess = !!(data?.isActive && data.tier === 'archive');
        setState({
          isLoading: false,
          hasAccess,
          expiresAt: data?.expiresAt ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ isLoading: false, hasAccess: false, expiresAt: null });
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  return state;
}

export default useArchiveAccess;
