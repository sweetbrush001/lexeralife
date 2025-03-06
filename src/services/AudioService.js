import { Audio } from 'expo-av';
import { AppState } from 'react-native';

/**
 * Improved Audio Service implementation with better error handling
 * and more robust state management
 */
class AudioService {
  constructor() {
    this.soundObject = null;
    this.isPlaying = false;
    this.currentTrackId = null;
    this.volume = 1.0;
    this.isInitialized = false;
    this.statusCallback = null;
    this.appStateSubscription = null;
  }

  /**
   * Initialize audio session with fixed interruptionModeIOS value
   */
  async init() {
    if (this.isInitialized) return true;
    
    try {
      console.log('Initializing audio...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        // Fix for invalid interruptionModeIOS - use numeric value 1
        interruptionModeIOS: 1, // This is INTERRUPTION_MODE_IOS_DO_NOT_MIX
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // This is INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
        playThroughEarpieceAndroid: false,
      });
      
      // Handle app state changes to manage audio in background
      this.setupAppStateListener();
      
      this.isInitialized = true;
      console.log('Audio initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing audio:', error);
      return false;
    }
  }

  /**
   * Set up AppState listener for background handling
   */
  setupAppStateListener() {
    // Clean up any existing listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    
    this.appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('App has come to the foreground');
        // Resume playing if needed
        this.handleAppActive();
      } else if (nextAppState === 'background') {
        console.log('App has gone to the background');
        // Optionally pause or handle background state
        // this.handleAppBackground();
      }
    });
  }

  /**
   * Handle app coming to foreground
   */
  async handleAppActive() {
    if (this.soundObject && this.isPlaying) {
      try {
        const status = await this.soundObject.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await this.soundObject.playAsync();
        }
      } catch (error) {
        console.error('Error resuming audio after app foregrounded:', error);
      }
    }
  }

  /**
   * Load and play sound with improved error handling
   */
  async playSound(uri, trackId, statusCallback) {
    try {
      // Initialize first (will only run once)
      await this.init();
      
      // Unload any existing sound
      await this.unloadSound();
      
      console.log(`Loading sound: ${trackId} from ${uri}`);
      
      // Store callback for later use
      this.statusCallback = statusCallback;
      
      // Validate URI before attempting to load
      if (!uri) {
        throw new Error('Invalid sound URI');
      }
      
      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: true, volume: this.volume },
        this._onPlaybackStatusUpdate.bind(this)
      );
      
      // Store reference and state
      this.soundObject = sound;
      this.isPlaying = true;
      this.currentTrackId = trackId;
      
      console.log(`Sound loaded and playing: ${trackId}`);
      return true;
    } catch (error) {
      console.error(`Error playing sound (${trackId}):`, error);
      this.resetState();
      
      // Check for specific connection/resource errors
      if (error.message && (
        error.message.includes('network') || 
        error.message.includes('connection') ||
        error.message.includes('404') ||
        error.message.includes('not found')
      )) {
        throw new Error('Sound file not available. Check your connection.');
      }
      
      throw error;
    }
  }

  /**
   * Central status update handler
   */
  _onPlaybackStatusUpdate(status) {
    // Always keep track of playing state internally
    if (status.isLoaded) {
      this.isPlaying = status.isPlaying;
    }
    
    // Forward status to external callback if provided
    if (this.statusCallback) {
      this.statusCallback(status);
    }
  }

  /**
   * Pause current sound
   */
  async pauseSound() {
    if (!this.soundObject) return false;
    
    try {
      const status = await this.soundObject.getStatusAsync();
      if (!status.isLoaded) {
        console.warn('Sound not loaded, nothing to pause');
        return false;
      }
      
      await this.soundObject.pauseAsync();
      this.isPlaying = false;
      return true;
    } catch (error) {
      console.error('Error pausing sound:', error);
      return false;
    }
  }

  /**
   * Resume playback of paused sound
   */
  async resumeSound() {
    if (!this.soundObject) return false;
    
    try {
      const status = await this.soundObject.getStatusAsync();
      if (!status.isLoaded) {
        console.warn('Sound not loaded, nothing to resume');
        return false;
      }
      
      await this.soundObject.playAsync();
      this.isPlaying = true;
      return true;
    } catch (error) {
      console.error('Error resuming sound:', error);
      return false;
    }
  }

  /**
   * Unload the sound resource with improved cleanup
   */
  async unloadSound() {
    if (!this.soundObject) return true;
    
    try {
      // Get status to check if it's actually loaded
      const status = await this.soundObject.getStatusAsync().catch(() => ({ isLoaded: false }));
      
      if (status.isLoaded) {
        // Only call stopAsync if it is a function
        if (this.soundObject && typeof this.soundObject.stopAsync === 'function') {
          // Stop first to ensure clean unload
          if (status.isPlaying) {
            await this.soundObject.stopAsync().catch(err => console.warn('Stop error:', err));
          }
        }
        
        // Then unload resources
        await this.soundObject.unloadAsync().catch(err => console.warn('Unload error:', err));
      }
    } catch (error) {
      console.error('Error during sound cleanup:', error);
    } finally {
      // Always reset state regardless of errors
      this.resetState();
      return true;
    }
  }

  /**
   * Reset all state variables
   */
  resetState() {
    this.soundObject = null;
    this.isPlaying = false;
    this.currentTrackId = null;
    // Don't reset statusCallback as it might be reused
  }

  /**
   * Set volume level with more granular control
   * @param {number} volume - Value from 0 to 1
   */
  async setVolume(volume) {
    // Validate and constrain volume value
    const validVolume = Math.max(0, Math.min(1, volume));
    this.volume = validVolume;
    
    if (!this.soundObject) return false;
    
    try {
      const status = await this.soundObject.getStatusAsync();
      if (status.isLoaded) {
        await this.soundObject.setVolumeAsync(validVolume);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting volume:', error);
      return false;
    }
  }

  /**
   * Clean up all resources
   */
  cleanup() {
    // Unload sound
    this.unloadSound();
    
    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    this.isInitialized = false;
    this.statusCallback = null;
  }

  /**
   * Get current status
   */
  async getStatus() {
    if (!this.soundObject) return null;
    
    try {
      return await this.soundObject.getStatusAsync();
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }
}

// Export singleton
export default new AudioService();
