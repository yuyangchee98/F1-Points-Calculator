import React, { useState, useEffect } from 'react';
import { demos } from '../../data/demoConfigs';

const SmartInputDemo: React.FC = () => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [driversVisible, setDriversVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [currentDemo] = useState(() => {
    const randomIndex = Math.floor(Math.random() * demos.length);
    return demos[randomIndex];
  });
  
  const command = currentDemo.command;
  
  useEffect(() => {
    const startDelay = setTimeout(() => {
      setShowCursor(true);

      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= command.length) {
          setTypedText(command.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setShowCursor(false);

          setTimeout(() => {
            setDriversVisible(true);
          }, 500);
        }
      }, 60);

      return () => clearInterval(typingInterval);
    }, 500);

    const resetInterval = setInterval(() => {
      setTypedText('');
      setShowCursor(false);
      setDriversVisible(false);

      setTimeout(() => {
        setShowCursor(true);
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
          if (currentIndex <= command.length) {
            setTypedText(command.slice(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typingInterval);
            setShowCursor(false);
            setTimeout(() => {
              setDriversVisible(true);
            }, 500);
          }
        }, 60);
      }, 500);
    }, 5000);
    
    return () => {
      clearTimeout(startDelay);
      clearInterval(resetInterval);
    };
  }, [command]);

  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  const renderDriverCard = (position: string, raceIndex: number) => {
    const race = currentDemo.races[raceIndex];
    const raceSpecificKey = `${race.code}-${position}`;
    const driver = currentDemo.drivers[raceSpecificKey] || currentDemo.drivers[position];
    if (!driver) return null;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '6px',
          overflow: 'hidden',
          borderLeft: driversVisible ? `4px solid ${driver.color}` : '4px solid transparent',
          backgroundColor: 'white',
          padding: '8px',
          width: '100%',
          height: '100%',
          position: 'relative',
          opacity: driversVisible ? 1 : 0,
          transform: driversVisible 
            ? 'scale(1)' 
            : 'scale(0.95)',
          transition: 'all 0.4s ease-out',
          transitionDelay: `${raceIndex * 100}ms`,
          boxSizing: 'border-box',
        }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '33.33%',
            opacity: 0.1,
            background: `linear-gradient(to right, ${driver.color} 0%, transparent 100%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          marginLeft: '8px',
          flexGrow: 1,
          zIndex: 1,
          textAlign: 'left',
        }}>
          <span style={{ 
            fontSize: isMobile ? '10px' : '11px',
            fontWeight: 'bold',
            color: '#111827',
          }}>
            {driver.name}
          </span>
          <span style={{ 
            fontSize: isMobile ? '8px' : '9px',
            color: driver.color,
          }}>
            {driver.team}
          </span>
        </div>
      </div>
    );
  };

  const gridColumns = currentDemo.races.length;
  const gridRows = currentDemo.positions.length;
  const shouldAutoScroll = isMobile && gridColumns > 1;

  const visibleRaces = currentDemo.races;

  useEffect(() => {
    if (!shouldAutoScroll) {
      setScrollPosition(0);
      setIsAutoScrolling(false);
      return;
    }

    if (isAutoScrolling) return;

    const scrollDelay = setTimeout(() => {
      setIsAutoScrolling(true);

      let position = 0;
      let direction = 1;
      const scrollInterval = setInterval(() => {
        position += direction * 2;

        const maxScroll = (gridColumns - 1) * 96;

        if (position >= maxScroll) {
          position = maxScroll;
          direction = -1;
        } else if (position <= 0) {
          position = 0;
          direction = 1;
        }

        setScrollPosition(position);
      }, 30);

      return () => clearInterval(scrollInterval);
    }, 1500);
    
    return () => clearTimeout(scrollDelay);
  }, [shouldAutoScroll, isAutoScrolling, gridColumns]);
  
  return (
    <div style={{ 
      width: isMobile ? '100%' : '380px', 
      maxWidth: '100%', 
      margin: '0 auto',
      padding: isMobile ? '0 10px' : '0'
    }}>
      <div style={{ position: 'relative', marginBottom: '15px', height: '38px' }}>
        <div
          style={{
            background: '#f9fafb',
            border: '2px solid #3b82f6',
            borderRadius: '6px',
            padding: '7px 11px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              color: typedText ? '#111827' : '#9ca3af',
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
            }}
          >
            {typedText || (!showCursor ? 'Type a command...' : '')}
            {showCursor && cursorVisible && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '18px',
                  background: '#3b82f6',
                  marginLeft: '2px',
                }}
              />
            )}
          </span>
        </div>
        
      </div>

      <div style={{
        overflowX: shouldAutoScroll ? 'hidden' : 'visible',
        width: '100%',
        position: 'relative',
      }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? `60px repeat(${gridColumns}, 90px)`
              : `70px repeat(${gridColumns}, 105px)`,
            gap: isMobile ? '6px' : '8px',
            gridTemplateRows: `auto repeat(${gridRows}, auto)`,
            width: isMobile ? 'max-content' : '100%',
            transform: shouldAutoScroll ? `translateX(-${scrollPosition}px)` : 'none',
            transition: isAutoScrolling ? 'none' : 'transform 0.3s ease-out',
          }}
        >
        <div style={{
          backgroundColor: '#374151',
          color: 'white',
          padding: isMobile ? '6px' : '8px',
          borderRadius: '6px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: isMobile ? '10px' : '11px',
        }}>
          Position
        </div>

        {visibleRaces.map((race) => (
          <div 
            key={race.code}
            style={{
              backgroundColor: race.blur ? '#6b7280' : '#374151',
              color: 'white',
              padding: isMobile ? '6px' : '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: isMobile ? '10px' : '11px',
              opacity: race.blur ? 0.5 : 1,
              filter: race.blur ? 'blur(8px)' : 'none',
            }}
          >
            {race.flag && `${race.flag} `}{race.name}
          </div>
        ))}

        {currentDemo.positions.map((position) => {
          const posNumber = parseInt(position.replace('P', ''));


          return (
            <React.Fragment key={position}>
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: isMobile ? '6px' : '8px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: isMobile ? '12px' : '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#374151',
              }}>
                {posNumber}
              </div>

              {visibleRaces.map((race, raceIndex) => (
                <div
                  key={`${race.code}-${position}`}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    height: isMobile ? '42px' : '48px',
                    padding: race.blur ? '8px' : '3px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    filter: race.blur ? 'blur(10px)' : 'none',
                    opacity: race.blur ? 0.3 : 1,
                  }}
                >
                  {race.blur ? (
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      height: '100%',
                      borderRadius: '4px',
                    }} />
                  ) : (
                    renderDriverCard(position, raceIndex)
                  )}
                </div>
              ))}
            </React.Fragment>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default SmartInputDemo;