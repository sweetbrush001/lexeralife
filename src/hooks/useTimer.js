import { useState, useEffect, useRef } from 'react';

export default function useTimer(onComplete) {
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);
  const endTimeRef = useRef(null);
  
  // Start the timer with given duration in minutes
  const startTimer = (minutes) => {
    // Clear any existing timer
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Calculate duration and end time
    const duration = minutes * 60 * 1000;
    endTimeRef.current = Date.now() + duration;
    
    // Set initial time
    setTimeLeft(duration);
    
    // Set up interval to update every second
    intervalRef.current = setInterval(() => {
      const remaining = endTimeRef.current - Date.now();
      
      if (remaining <= 0) {
        // Timer complete
        clearInterval(intervalRef.current);
        setTimeLeft(0);
        intervalRef.current = null;
        if (onComplete) onComplete();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
  };
  
  // Stop the timer
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeLeft(null);
  };
  
  // Format the time for display (mm:ss)
  const formatTime = () => {
    if (!timeLeft && timeLeft !== 0) return '0:00';
    
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Clean up the interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  
  return {
    timeLeft,
    isRunning: !!intervalRef.current,
    startTimer,
    stopTimer,
    formatTime,
  };
}
