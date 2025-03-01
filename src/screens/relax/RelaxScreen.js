import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ImageBackground,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import TTSVoiceButton from '../../components/TTSVoiceButton';

const { width, height } = Dimensions.get('window');
const cardSize = width / 2 - 30; // Calculate card size based on screen width

const RelaxScreen = () => {
  const navigation = useNavigation();
  const [playingTrack, setPlayingTrack] = useState(null);
  
  // Sound tracks data
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
      id: 'night', 
      name: 'Night Sounds', 
      icon: 'moon', 
      color: '#5C6BC0',
      gradient: ['#3949AB', '#7986CB']
    },
    { 
      id: 'wind', 
      name: 'Gentle Breeze', 
      icon: 'wind', 
      color: '#78909C',
      gradient: ['#546E7A', '#90A4AE']
    },
    { 
      id: 'piano', 
      name: 'Peaceful Piano', 
      icon: 'music', 
      color: '#EC407A',
      gradient: ['#D81B60', '#F06292']
    },
    { 
      id: 'meditation', 
      name: 'Meditation Bells', 
      icon: 'bell', 
      color: '#AB47BC',
      gradient: ['#8E24AA', '#CE93D8']
    },
    { 
      id: 'birds', 
      name: 'Birdsong', 
      icon: 'dove', 
      color: '#26A69A',
      gradient: ['#00897B', '#4DB6AC']
    },
    { 
      id: 'whitenoise', 
      name: 'White Noise', 
      icon: 'fan', 
      color: '#7E57C2',
      gradient: ['#5E35B1', '#9575CD']
    }
  ];

  // Toggle sound playback
  const toggleSound = (trackId) => {
    if (playingTrack === trackId) {
      setPlayingTrack(null); // Stop playing
    } else {
      setPlayingTrack(trackId); // Start playing this track
    }
    
    // Here you would actually play/pause sounds using a sound library
    // For this example, we're just tracking the selected state
  };

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
            
            {/* Popular Category Title */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Tracks</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {/* Sounds Grid */}
            <View style={styles.soundGrid}>
              {soundTracks.map((track) => (
                <TouchableOpacity 
                  key={track.id} 
                  style={styles.soundCard}
                  onPress={() => toggleSound(track.id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={track.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.soundCardGradient}
                  >
                    <View style={styles.soundIconContainer}>
                      <Icon name={track.icon} size={36} color="#fff" />
                      {playingTrack === track.id && (
                        <View style={styles.playingIndicator}>
                          <Icon name="volume-up" size={14} color="#fff" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.soundName}>{track.name}</Text>
                    <TouchableOpacity 
                      style={styles.playButton}
                      onPress={() => toggleSound(track.id)}
                    >
                      <Icon 
                        name={playingTrack === track.id ? "pause" : "play"} 
                        size={16} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Featured Track */}
            <View style={styles.featuredContainer}>
              <Text style={styles.featuredTitle}>Featured Mix</Text>
              <TouchableOpacity style={styles.featuredCard}>
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
          {playingTrack && (
            <View style={styles.nowPlayingBar}>
              <View style={styles.nowPlayingInfo}>
                <Icon 
                  name={soundTracks.find(t => t.id === playingTrack)?.icon || 'music'} 
                  size={24} 
                  color="#fff" 
                />
                <Text style={styles.nowPlayingText}>
                  {soundTracks.find(t => t.id === playingTrack)?.name || 'Track'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.nowPlayingControl}
                onPress={() => setPlayingTrack(null)}
              >
                <Icon name="stop" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Draggable Voice Button */}
          <TTSVoiceButton />
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
});

export default RelaxScreen;