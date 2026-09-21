import { Provider } from 'react-redux';
import { store } from '../../store';
import UserMenu from '../auth/UserMenu';
import AuthModal from '../auth/AuthModal';

/**
 * The only interactive part of the spine.
 *
 * The spine itself is static Astro so it renders on pages that ship no React at
 * all. Auth is the exception — it needs the session and Redux — so it mounts as
 * its own island here rather than dragging the whole header into React.
 *
 * `store` (src/store/index.ts) is a module-level singleton, so this island and
 * AppIsland/CompeteIsland share one store: signing in from the spine updates the
 * calculator behind it. That also means this island owns <AuthModal/> for the
 * whole site — Layout.tsx and Compete.tsx must not render their own, or the
 * modal appears twice.
 */
export default function SpineAccountIsland() {
  return (
    <Provider store={store}>
      <UserMenu />
      <AuthModal />
    </Provider>
  );
}
