import { useEffect, useRef, useState } from 'react';
import { appConfig } from '../config/app.config';

export const useWakeLock = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if Wake Lock API is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  // Request wake lock
  const requestWakeLock = async () => {
    if (!isSupported || !appConfig.wakeLock.enabled) return;

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsActive(true);

      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false);
      });

      console.log('Wake Lock activated');
    } catch (err: any) {
      console.error(`Wake Lock request failed: ${err.message}`);
    }
  };

  // Release wake lock
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsActive(false);
        console.log('Wake Lock released');
      } catch (err: any) {
        console.error(`Wake Lock release failed: ${err.message}`);
      }
    }
  };

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    if (appConfig.wakeLock.inactivityTimeout > 0) {
      inactivityTimeoutRef.current = setTimeout(() => {
        releaseWakeLock();
      }, appConfig.wakeLock.inactivityTimeout);
    }
  };

  // Handle user activity (touch, mouse, keyboard)
  useEffect(() => {
    if (!isSupported || !appConfig.wakeLock.enabled) return;

    const handleActivity = () => {
      if (!isActive) {
        requestWakeLock();
      }
      resetInactivityTimer();
    };

    // Listen to various user activity events
    const events = ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'keydown', 'scroll'];

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Reacquire wake lock when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isActive) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial wake lock request
    requestWakeLock();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }

      releaseWakeLock();
    };
  }, [isSupported, isActive]);

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock,
  };
};
