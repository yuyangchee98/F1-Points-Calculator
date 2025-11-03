import React, { ReactNode, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import MobileNavigation from '../navigation/MobileNavigation';
import useWindowSize from '../../hooks/useWindowSize';
import { setMobileView } from '../../store/slices/uiSlice';
import { useAppDispatch } from '../../store';

interface LayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ sidebar, content }) => {
  const dispatch = useAppDispatch();
  // Get the current mobile view from Redux
  const mobileView = useSelector((state: RootState) => state.ui.mobileView);
  const { isMobile } = useWindowSize();
  
  // State to track if sidebar is collapsed on desktop/tablet
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Local storage key
  const SIDEBAR_COLLAPSED_KEY = 'f1-calc-sidebar-collapsed';
  
  // Load sidebar collapsed state from localStorage on mount
  useEffect(() => {
    const storedValue = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (storedValue !== null) {
      setIsSidebarCollapsed(storedValue === 'true');
    }
  }, []);
  
  // Save sidebar collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState));
  };

  // Auto-update layout when window is resized to/from mobile
  useEffect(() => {
    // When in tablet/desktop mode, ensure we render all components
    if (!isMobile) {
      // Only dispatch if needed to avoid unnecessary renders
      if (mobileView !== 'grid') {
        dispatch(setMobileView('grid'));
      }
    }
  }, [isMobile, mobileView, dispatch]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col sm:flex-row">
        {/* Sidebar - Only visible on tablet/desktop or when selected on mobile */}
        <aside 
          className={`
            ${mobileView === 'standings' ? 'block w-full h-[calc(100vh-64px)] z-30' : 'hidden'} 
            sm:block bg-white border-r border-gray-200 overflow-hidden shadow-md
            transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? 'sm:w-16' : 'sm:w-72 lg:w-1/4 min-w-[280px] max-w-[450px]'}
            sm:sticky sm:top-0 sm:h-screen sm:z-20
          `}
        >
          {/* Collapse toggle button - made more visible */}
          <button 
            onClick={toggleSidebar}
            className="hidden sm:flex absolute right-0 top-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-l-md p-2 shadow-md z-10"
            style={{ transform: 'translateX(100%)' }}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{ transform: isSidebarCollapsed ? 'rotate(180deg)' : 'none' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Sidebar content */}
          <div className={`h-full ${isSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-opacity duration-300 overflow-auto`}>
            {sidebar}
          </div>
          
          {/* Collapsed sidebar icons */}
          {isSidebarCollapsed && (
            <div className="flex flex-col items-center pt-4 space-y-6">
              <div className="text-xl font-bold text-red-600">F1</div>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          )}
        </aside>
      
        {/* Main Content */}
        <main 
          className={`
            flex-1 relative ${mobileView !== 'standings' ? 'block' : 'hidden sm:block'}
            transition-all duration-300 ease-in-out
            pt-0 min-h-screen
          `}
        >
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Main page content */}
            {content}
          </div>
          <footer className="bg-gray-900 text-white py-8 mt-12 pb-24 sm:pb-8 sm:mt-auto">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between space-y-6 sm:space-y-0">
              <div>
                <h3 className="text-lg font-medium mb-3">F1 Points Calculator</h3>
                <p className="text-sm text-gray-400 mb-2">Created by <a href="https://yaaaang.com" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Chyuang</a></p>
                <p className="text-sm text-gray-400 mb-2"><a href="https://github.com/yuyangchee98/F1-Points-Calculator" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Open source on GitHub</a></p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">F1 Resources</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li><a href="https://f1-dash.com/" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">F1 Dash</a></li>
                  <li><a href="https://f1calendar.com/" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">F1 Calendar</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Other Projects</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li><a href="https://chyuang.com/" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Chyuang</a></li>
                  <li><a href="https://solvethisoaforme.chyuang.com/" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Solve This OA For Me</a></li>
                  <li><a href="https://japanese-patent-attorney-rankings.chyuang.com/" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Japanese Patent Attorney Rankings</a></li>
                  <li><a href="https://try-pro-tools-for-google-patents-by-readpatents.chyuang.com/" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Pro Tools for Google Patents</a></li>
                </ul>
              </div>
            </div>
          </footer>
        </main>

        {/* Mobile Navigation - only visible on mobile */}
        <div className="sm:hidden">
          <MobileNavigation />
        </div>
      </div>
    </div>
  );
};

export default Layout;