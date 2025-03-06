import { useState, useEffect, useRef, useCallback } from 'react';
import AudioService from '../services/AudioService';

/**
 * Improved audio player hook with better state management
 * and error handling
 */
export default function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolumeState] = useState(1.0);
  
  // Debounce control - prevent rapid clicking
  const debounceTimerRef = useRef(null);
  const isOperationInProgressRef = useRef(false);
  
  // Clear error after delay
  useEffect(() => {
    let errorTimer;
    if (error) {
      errorTimer = setTimeout(() => {
        setError(null);
      }, 3000);
    }
    
    return () => {
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [error]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending operations
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Clean up audio resources
      AudioService.cleanup();
    };
  }, []);

  /**
   * Debounce function to prevent rapid operations
   */
  const debounce = (func, delay = 300) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (isOperationInProgressRef.current) {
      return Promise.resolve(false);
    }
    
    return new Promise(resolve => {
      debounceTimerRef.current = setTimeout(() => {
        isOperationInProgressRef.current = true;
        Promise.resolve(func())
          .then(result => {
            isOperationInProgressRef.current = false;
            resolve(result);
          })
          .catch(err => {
            isOperationInProgressRef.current = false;
            console.error('Operation error:', err);
            resolve(false);
          });
      }, delay);
    });
  };

  /**
   * Play a track with improved state handling
   */
  const playTrack = useCallback(async (uri, trackId, metadata = {}) => {
    return debounce(async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If same track is already playing, pause it
        if (currentTrack?.id === trackId && isPlaying) {
          await AudioService.pauseSound();
          setIsPlaying(false);
          return true;
        }
        
        // If same track is paused, resume it
        if (currentTrack?.id === trackId && !isPlaying) {
          const resumed = await AudioService.resumeSound();
          if (resumed) {
            setIsPlaying(true);
            return true;
          } else {
            // If resume fails, try loading again
            console.log('Resume failed, reloading track');
          }
        }
        
        // Load and play new track
        await AudioService.playSound(uri, trackId, handleStatus);
        setCurrentTrack({ id: trackId, uri, ...metadata });
        setIsPlaying(true);
        return true;
      } catch (err) {
        console.error(`Error in playTrack (${trackId}):`, err);
        
        // Provide specific error messages based on error type
        if (err.message?.includes('not available') || err.message?.includes('connection')) {
          setError(`Could not load "${metadata.name || 'track'}". Check your connection.`);
        } else {
          setError(`Problem playing "${metadata.name || 'track'}". ${err.message || ''}`);
        }
        
        // Reset state
        setCurrentTrack(null);
        setIsPlaying(false);
        return false;
      } finally {
        setLoading(false);
      }
    });
  }, []);

  /**
   * Handle playback status updates
   */
  const handleStatus = useCallback((status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
    
    // You could add more status handling here if needed
  }, []);

  /**
   * Stop track playback
   */
  const stopTrack = useCallback(async () => {
    return debounce(async () => {
      try {
        setLoading(true);
        await AudioService.unloadSound();
        setCurrentTrack(null);
        setIsPlaying(false);
        return true;
      } catch (err) {
        console.error('Error stopping track:', err);
        // Reset UI state even if there was an error
        setCurrentTrack(null);
        setIsPlaying(false);
        return false;
      } finally {
        setLoading(false);
      }
    });
  }, []);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(async () => {
    return debounce(async () => {
      if (!currentTrack) return false;
      
      try {
        setLoading(true);
        
        if (isPlaying) {
          const paused = await AudioService.pauseSound();
          if (paused) setIsPlaying(false);
          return paused;
        } else {
          const resumed = await AudioService.resumeSound();
          if (resumed) setIsPlaying(true);
          return resumed;
        }
      } catch (err) {
        console.error('Error toggling playback:', err);
        setError('Playback control failed');
        return false;
      } finally {
        setLoading(false);
      }
    });
  }, [currentTrack, isPlaying]);

  /**
   * Set volume with improved handling
   */
  const setVolume = useCallback(async (value) => {
    // Ensure value is between 0-1
    const validValue = Math.max(0, Math.min(1, value));
    
    try {
      await AudioService.setVolume(validValue);
      setVolumeState(validValue);
      return true;
    } catch (err) {
      console.error('Error setting volume:', err);
      return false;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    currentTrack,
    isPlaying,
    loading,
    error,
    volume,
    playTrack,
    stopTrack,
    togglePlayPause,
    setVolume,
    clearError,
  };
}
