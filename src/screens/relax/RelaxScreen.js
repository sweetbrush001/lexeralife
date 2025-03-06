import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ImageBackground,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient'; 
import useAudioPlayer from '../../hooks/useAudioPlayer';
import useTimer from '../../hooks/useTimer';
import MusicPlayer from '../../components/MusicPlayer';
import { validateCloudinaryResources, getAllRelaxationSoundUrls } from '../../utils/CloudinaryHelper';

const { width, height } = Dimensions.get('window');
const cardSize = width / 2 - 30;

const RelaxScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [trackUrls, setTrackUrls] = useState({});
  const [error, setError] = useState(null);
  const [loadingSoundId, setLoadingSoundId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [unavailableTracks, setUnavailableTracks] = useState([]);
  
  // Added to prevent URL fetching loop
  const urlsLoadedRef = useRef(false);
  const validationRunningRef = useRef(false);
  
  // Use our new audio player hook
  const { 
    currentTrack, 
    isPlaying, 
    loading: audioLoading, 
    error: audioError, 
    volume,
    playTrack,
    stopTrack,
    togglePlayPause,
    setVolume,
    clearError: clearAudioError
  } = useAudioPlayer();
  
  // Use our timer hook
  const { 
    timeLeft, 
    isRunning: timerIsRunning, 
    startTimer, 
    stopTimer, 
    formatTime: formatTimerDisplay 
  } = useTimer(onTimerComplete);
  
  // Handle timer completion with proper state updates
  function onTimerComplete() {
    console.log("Timer completed - stopping playback");
    stopTrack().then(() => {
      // Make sure UI reflects stopped state
      setError(null);
    });
  }
  
  // Show any audio errors
  useEffect(() => {
    let errorTimer;
    
    if (audioError) {
      setError(audioError);
      errorTimer = setTimeout(() => {
        clearAudioError();
        setError(null);
      }, 3000);
    }
    
    return () => {
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [audioError, clearAudioError]);

  // Fetch and validate music URLs - FIXED to prevent infinite loop
  useEffect(() => {
    // Skip if we've already loaded URLs or if validation is in progress
    if (urlsLoadedRef.current || validationRunningRef.current) return;
    
    validationRunningRef.current = true;
    
    const fetchAndValidateUrls = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get URLs
        const urls = getAllRelaxationSoundUrls();
        console.log("Generated URLs once:", urls);
        
        // Validate resources
        const { valid, invalidResources } = await validateCloudinaryResources(urls);
        
        if (!valid && invalidResources.length > 0) {
          console.warn("Some resources unavailable:", invalidResources);
          setUnavailableTracks(invalidResources);
        }
        
        setTrackUrls(urls);
        urlsLoadedRef.current = true; // Mark as loaded
      } catch (err) {
        console.error("Error setting up music URLs:", err);
        setError("Failed to load music tracks. Please check your connection.");
      } finally {
        setLoading(false);
        validationRunningRef.current = false;
      }
    };
    
    fetchAndValidateUrls();
    
    // Empty dependency array - only run once on mount
  }, []);
  
  // Separate cleanup effect
  useEffect(() => {
    return () => {
      console.log("Cleaning up RelaxScreen");
      stopTrack();
    };
  }, [stopTrack]);
  
  // Improved track selection with error checking
  const handleTrackSelect = useCallback(async (trackId) => {
    // Check if track is unavailable
    if (unavailableTracks.includes(trackId)) {
      setError(`This track is currently unavailable.`);
      return;
    }
    
    try {
      setLoadingSoundId(trackId);
      
      const track = soundTracks.find(t => t.id === trackId);
      if (!track) {
        setError(`Track ${trackId} not found`);
        return;
      }
      
      const uri = trackUrls[trackId];
      if (!uri) {
        setError(`URL for track ${track.name} not found`);
        return;
      }
      
      // If this track is already playing, stop it
      if (currentTrack?.id === trackId && isPlaying) {
        await stopTrack();
      } else {
        // Otherwise play the new track
        await playTrack(uri, trackId, track);
      }
    } catch (err) {
      console.error("Error selecting track:", err);
      setError(`Failed to play ${trackId}`);
    } finally {
      setLoadingSoundId(null);
    }
  }, [unavailableTracks, trackUrls, playTrack, stopTrack, currentTrack, isPlaying, soundTracks]);

  // Add a function to toggle favorite status
  const toggleFavorite = (trackId) => {
    if (favorites.includes(trackId)) {
      setFavorites(favorites.filter(id => id !== trackId));
    } else {
      setFavorites([...favorites, trackId]);
    }
  };

  // Handle starting a timed session
  const handleStartTimer = (minutes) => {
    if (!currentTrack) {
      setError("Please select a track before starting the timer");
      return;
    }
    
    startTimer(minutes);
  };

  // Add a function for the featured mix
  const playFeaturedMix = () => {
    // Play the rainfall track as a featured mix
    handleTrackSelect('rain');
  };

  // Updated sound tracks data - only include the 5 tracks you have
  const soundTracks = [
    { 
      id: 'rain', 
      name: 'Rainfall', 
      icon: 'cloud-rain',
      color: '#4A6572',
      gradient: ['#344955', '#607D8B']
    },
    { 
      id: 'forest', 
      name: 'Forest Ambience', 
      icon: 'tree', 
      color: '#66BB6A',
      gradient: ['#4CAF50', '#8BC34A']
    },
    { 
      id: 'waves', 
      name: 'Ocean Waves', 
      icon: 'water', 
      color: '#29B6F6',
      gradient: ['#0288D1', '#4FC3F7']
    },
    { 
      id: 'fire', 
      name: 'Crackling Fire', 
      icon: 'fire', 
      color: '#FF7043',
      gradient: ['#E64A19', '#FF9800']
    },
    { 
      id: 'piano', 
      name: 'Peaceful Piano', 
      icon: 'music', 
      color: '#EC407A',
      gradient: ['#D81B60', '#F06292']
    }
  ];

  return (
    <ImageBackground
      source={require('../../../assets/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(255,153,153,0.7)', 'rgba(255,255,255,0.3)']}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Relax with Music</Text>
            <View style={styles.placeholder} />
          </View>
          
          {/* Main Content */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* Banner */}
            <View style={styles.banner}>
              <View style={styles.bannerContent}>
                <Icon name="headphones" size={32} color="#fff" />
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>Soothing Sounds</Text>
                  <Text style={styles.bannerSubtitle}>Find peace in these calming audio tracks</Text>
                </View>
              </View>
            </View>
            
            {/* Favorites Section - New */}
            {favorites.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your Favorites</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.favoritesContainer}
                >
                  {soundTracks
                    .filter(track => favorites.includes(track.id))
                    .map(track => (
                      <TouchableOpacity
                        key={`fav-${track.id}`}
                        style={styles.favoriteCard}
                        onPress={() => handleTrackSelect(track.id)}
                      >
                        <LinearGradient
                          colors={track.gradient}
                          style={styles.favoriteGradient}
                        >
                          <Icon name={track.icon} size={24} color="#fff" />
                          <Text style={styles.favoriteText}>{track.name}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </>
            )}
            
            {/* Timer Controls - New */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerTitle}>Relaxation Timer</Text>
              <View style={styles.timerButtons}>
                <TouchableOpacity 
                  style={[styles.timerButton, timerIsRunning && styles.timerButtonDisabled]} 
                  onPress={() => handleStartTimer(5)}
                  disabled={timerIsRunning}
                >
                  <Text style={styles.timerButtonText}>5 Min</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.timerButton, timerIsRunning && styles.timerButtonDisabled]} 
                  onPress={() => handleStartTimer(15)}
                  disabled={timerIsRunning}
                >
                  <Text style={styles.timerButtonText}>15 Min</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.timerButton, timerIsRunning && styles.timerButtonDisabled]} 
                  onPress={() => handleStartTimer(30)}
                  disabled={timerIsRunning}
                >
                  <Text style={styles.timerButtonText}>30 Min</Text>
                </TouchableOpacity>
              </View>
              
              {timerIsRunning && (
                <View style={styles.timerActiveContainer}>
                  <Text style={styles.timerCountdown}>
                    Time remaining: {formatTimerDisplay()}
                  </Text>
                  <TouchableOpacity 
                    style={styles.timerCancelButton}
                    onPress={stopTimer}
                  >
                    <Text style={styles.timerCancelText}>Cancel Timer</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {/* Popular Category Title */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Tracks</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {/* Sounds Grid */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF9999" />
                <Text style={styles.loadingText}>Loading sounds...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Icon name="exclamation-circle" size={40} color="#FF5E62" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => navigation.replace('Relax')}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.soundGrid}>
                {soundTracks.map((track) => (
                  <TouchableOpacity 
                    key={track.id} 
                    style={[
                      styles.soundCard, 
                      currentTrack?.id === track.id && styles.activeCard
                    ]}
                    onPress={() => handleTrackSelect(track.id)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={track.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.soundCardGradient}
                    >
                      <View style={styles.soundCardHeader}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track.id);
                          }}
                          style={styles.favoriteButton}
                        >
                          <Icon 
                            name="heart" 
                            size={16} 
                            color="#fff" 
                            solid={favorites.includes(track.id)}
                          />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.soundIconContainer}>
                        {loadingSoundId === track.id || (currentTrack?.id === track.id && audioLoading) ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Icon name={track.icon} size={36} color="#fff" />
                        )}
                        {currentTrack?.id === track.id && isPlaying && (
                          <View style={styles.playingIndicator}>
                            <Icon name="volume-up" size={14} color="#fff" />
                          </View>
                        )}
                      </View>
                      
                      <Text style={styles.soundName}>{track.name}</Text>
                      
                      <TouchableOpacity 
                        style={[
                          styles.playButton,
                          currentTrack?.id === track.id && styles.activePlayButton
                        ]}
                        onPress={() => handleTrackSelect(track.id)}
                      >
                        <Icon 
                          name={currentTrack?.id === track.id && isPlaying ? "stop" : "play"} 
                          size={16} 
                          color={currentTrack?.id === track.id ? track.gradient[0] : "#fff"} 
                        />
                      </TouchableOpacity>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Featured Track */}
            <View style={styles.featuredContainer}>
              <Text style={styles.featuredTitle}>Featured Mix</Text>
              <TouchableOpacity 
                style={styles.featuredCard}
                onPress={playFeaturedMix}
              >
                <LinearGradient
                  colors={['#FF9966', '#FF5E62']}
                  style={styles.featuredGradient}
                >
                  <View style={styles.featuredContent}>
                    <View>
                      <Text style={styles.featuredName}>Sleep Better</Text>
                      <Text style={styles.featuredDescription}>Perfect mix of gentle sounds to help you sleep</Text>
                    </View>
                    <TouchableOpacity style={styles.featuredPlayButton}>
                      <Icon name="play" size={20} color="#FF5E62" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
          </ScrollView>
          
          {/* Currently Playing Bar (shows when a track is playing) */}
          {currentTrack && (
            <MusicPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              loading={audioLoading}
              onStop={stopTrack}
              timerText={timerIsRunning ? formatTimerDisplay() : null}
              style={styles.nowPlayingBar}
            />
          )}
          
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  banner: {
    margin: 20,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FF9999',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bannerContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#FF9999',
    fontWeight: '500',
  },
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  soundCard: {
    width: cardSize,
    height: cardSize,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  soundCardGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  soundIconContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  playButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingIndicator: {
    position: 'absolute',
    top: -10,
    right: -20,
    backgroundColor: '#4CAF50',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  featuredContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  featuredGradient: {
    padding: 20,
  },
  featuredContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    maxWidth: '80%',
  },
  featuredPlayButton: {
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF9999',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  nowPlayingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nowPlayingText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 12,
  },
  nowPlayingControl: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF9999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF5E62',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FF5E62',
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
  // New styles for the enhanced UI
  activeCard: {
    transform: [{scale: 1.02}],
  },
  soundCardHeader: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 10,
  },
  favoriteButton: {
    padding: 8,
  },
  activePlayButton: {
    backgroundColor: '#fff',
  },
  favoritesContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  favoriteCard: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  favoriteGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  favoriteText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  timerContainer: {
    margin: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    backgroundColor: '#FF9999',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  timerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  timerCountdown: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    color: '#FF5E62',
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
  },
  nowPlayingTimer: {
    marginLeft: 10,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  timerButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  timerActiveContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  timerCancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FF5E62',
    borderRadius: 20,
  },
  timerCancelText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default RelaxScreen;