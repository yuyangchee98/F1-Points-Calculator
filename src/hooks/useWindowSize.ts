import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../utils/constants';

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const isMobile = width < BREAKPOINTS.mobile;
      const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
      const isDesktop = width >= BREAKPOINTS.tablet;
      
      setWindowSize({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop
      });
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export default useWindowSize;