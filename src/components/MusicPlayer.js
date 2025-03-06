import React, { useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

/**
 * Simplified music player component with only stop functionality
 */
const MusicPlayer = ({
  track,
  isPlaying,
  onStop,
  loading,
  timerText,
  style
}) => {
  // Debounce handling
  const lastClickTime = useRef(0);
  const DEBOUNCE_DELAY = 300; // ms
  
  /**
   * Debounced stop function
   */
  const handleStop = useCallback(() => {
    const now = Date.now();
    
    // If loading or clicked too recently, ignore
    if (loading || (now - lastClickTime.current) < DEBOUNCE_DELAY) {
      return;
    }
    
    // Update last click time
    lastClickTime.current = now;
    
    // Call the handler
    onStop();
  }, [loading, onStop]);

  // Safety check - don't render if track is missing
  if (!track) return null;
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.trackInfo}>
        <Icon 
          name={track.icon || 'music'} 
          size={24} 
          color="#fff" 
        />
        <Text style={styles.trackName} numberOfLines={1}>
          {track.name || 'Unknown Track'}
        </Text>
        {timerText && (
          <Text style={styles.timerText}>
            {timerText}
          </Text>
        )}
      </View>
      
      <View style={styles.controls}>
        {/* Single Stop button */}
        <TouchableOpacity 
          style={[styles.controlButton, loading && styles.disabledButton]}
          onPress={handleStop}
          disabled={loading}
          activeOpacity={loading ? 0.8 : 0.5}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="stop" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF9999',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  trackName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  timerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 10,
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default React.memo(MusicPlayer); // Use memo to prevent unnecessary re-renders
