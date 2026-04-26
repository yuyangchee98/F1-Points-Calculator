import React, { type ReactNode, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import MobileNavigation from '../navigation/MobileNavigation';
import useWindowSize from '../../hooks/useWindowSize';
import { setMobileView } from '../../store/slices/uiSlice';
import { useAppDispatch } from '../../store';
import AuthModal from '../auth/AuthModal';

interface LayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ sidebar, content }) => {
  const dispatch = useAppDispatch();
  const mobileView = useSelector((state: RootState) => state.ui.mobileView);
  const { isMobile } = useWindowSize();

  useEffect(() => {
    if (!isMobile) {
      if (mobileView !== 'grid') {
        dispatch(setMobileView('grid'));
      }
    }
  }, [isMobile, mobileView, dispatch]);

  return (
    <div className="h-full bg-gray-100">
      <div className="flex flex-col sm:flex-row h-full">
        <aside
          className={`
            ${mobileView === 'standings' ? 'block w-full h-[calc(100dvh-64px)] z-30' : 'hidden'}
            sm:block bg-white border-r border-gray-200 overflow-hidden shadow-md
            sm:w-72 lg:w-1/4 min-w-[280px] max-w-[450px]
            sm:h-full sm:z-20
          `}
        >
          <div className="h-full overflow-auto">
            {sidebar}
          </div>
        </aside>

        <main
          className={`
            flex-1 flex flex-col overflow-hidden relative
            ${mobileView !== 'standings' ? '' : 'hidden sm:flex'}
          `}
        >
          <div className="flex-1 min-h-0 flex flex-col">
            {content}
          </div>
        </main>

        <div className="sm:hidden">
          <MobileNavigation />
        </div>
      </div>

      <AuthModal />
    </div>
  );
};

export default Layout;
