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
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import TTSVoiceButton from '../../components/TTSVoiceButton';

const RelaxScreen = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('breathing');

  const categories = [
    { id: 'breathing', name: 'Breathing', icon: 'wind' },
    { id: 'meditation', name: 'Meditation', icon: 'brain' },
    { id: 'sounds', name: 'Sounds', icon: 'volume-up' },
    { id: 'stories', name: 'Stories', icon: 'book-open' }
  ];

  const renderContent = () => {
    switch (activeCategory) {
      case 'breathing':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Breathing Exercises</Text>
            
            <TouchableOpacity style={styles.exerciseCard}>
              <View style={styles.exerciseIconContainer}>
                <Icon name="lungs" size={50} color="#FF9999" />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>4-7-8 Breathing</Text>
                <Text style={styles.exerciseDescription}>Inhale for 4 seconds, hold for 7, exhale for 8</Text>
                <Text style={styles.exerciseDuration}>5 minutes</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.exerciseCard}>
              <View style={styles.exerciseIconContainer}>
                <Icon name="box" size={50} color="#FF9999" />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>Box Breathing</Text>
                <Text style={styles.exerciseDescription}>Equal counts for inhale, hold, exhale, and hold</Text>
                <Text style={styles.exerciseDuration}>7 minutes</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.exerciseCard}>
              <View style={styles.exerciseIconContainer}>
                <Icon name="wind" size={50} color="#FF9999" />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>Deep Breathing</Text>
                <Text style={styles.exerciseDescription}>Focus on deep, slow breaths from your diaphragm</Text>
                <Text style={styles.exerciseDuration}>10 minutes</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      case 'meditation':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Guided Meditations</Text>
            
            <TouchableOpacity style={styles.exerciseCard}>
              <View style={styles.exerciseIconContainer}>
                <Icon name="user" size={50} color="#FF9999" />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>Body Scan</Text>
                <Text style={styles.exerciseDescription}>Relax each part of your body step-by-step</Text>
                <Text style={styles.exerciseDuration}>15 minutes</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.exerciseCard}>
              <View style={styles.exerciseIconContainer}>
                <Icon name="brain" size={50} color="#FF9999" />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>Mindfulness</Text>
                <Text style={styles.exerciseDescription}>Bring awareness to your present moment</Text>
                <Text style={styles.exerciseDuration}>10 minutes</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      case 'sounds':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Soothing Sounds</Text>
            
            <View style={styles.soundGrid}>
              <TouchableOpacity style={styles.soundCard}>
                <View style={styles.soundIconContainer}>
                  <Icon name="water" size={24} color="#FF9999" />
                </View>
                <Text style={styles.soundName}>Rain</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.soundCard}>
                <View style={styles.soundIconContainer}>
                  <Icon name="fire" size={24} color="#FF9999" />
                </View>
                <Text style={styles.soundName}>Fireplace</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.soundCard}>
                <View style={styles.soundIconContainer}>
                  <Icon name="tree" size={24} color="#FF9999" />
                </View>
                <Text style={styles.soundName}>Forest</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.soundCard}>
                <View style={styles.soundIconContainer}>
                  <Icon name="fan" size={24} color="#FF9999" />
                </View>
                <Text style={styles.soundName}>White Noise</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.soundCard}>
                <View style={styles.soundIconContainer}>
                  <Icon name="cloud-rain" size={24} color="#FF9999" />
                </View>
                <Text style={styles.soundName}>Thunderstorm</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.soundCard}>
                <View style={styles.soundIconContainer}>
                  <Icon name="music" size={24} color="#FF9999" />
                </View>
                <Text style={styles.soundName}>Piano</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'stories':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Calming Stories</Text>
            
            <TouchableOpacity style={styles.storyCard}>
              <View style={styles.storyIconContainer}>
                <Icon name="tree" size={40} color="#FF9999" />
              </View>
              <View style={styles.storyInfo}>
                <Text style={styles.storyName}>The Peaceful Meadow</Text>
                <Text style={styles.storyDuration}>12 minutes</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.storyCard}>
              <View style={styles.storyIconContainer}>
                <Icon name="water" size={40} color="#FF9999" />
              </View>
              <View style={styles.storyInfo}>
                <Text style={styles.storyName}>Ocean Journey</Text>
                <Text style={styles.storyDuration}>15 minutes</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.storyCard}>
              <View style={styles.storyIconContainer}>
                <Icon name="mountain" size={40} color="#FF9999" />
              </View>
              <View style={styles.storyInfo}>
                <Text style={styles.storyName}>Mountain Retreat</Text>
                <Text style={styles.storyDuration}>18 minutes</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      default:
        return <View />;
    }
  };

  return (
    <ImageBackground
    source={require('../../../assets/background.png')} style={styles.backgroundImage}
      resizeMode="cover"
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
          <Text style={styles.headerTitle}>Relax & Unwind</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Main Content */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Take a Moment for Yourself</Text>
            <Text style={styles.bannerSubtitle}>Reduce stress & improve focus</Text>
          </View>
          
          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  activeCategory === category.id && styles.activeCategoryButton
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <View style={[
                  styles.categoryIcon,
                  activeCategory === category.id && styles.activeCategoryIcon
                ]}>
                  <Icon 
                    name={category.icon} 
                    size={20} 
                    color={activeCategory === category.id ? "#FF9999" : "#999"} 
                  />
                </View>
                <Text style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.activeCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Category Content */}
          {renderContent()}
        </ScrollView>
        
        {/* Draggable Voice Button */}
        <TTSVoiceButton />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  banner: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 153, 153, 0.9)',
    marginTop: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 16,
  },
  categoriesContainer: {
    marginVertical: 20,
  },
  categoriesContent: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    alignItems: 'center',
    marginHorizontal: 10,
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeCategoryButton: {
    backgroundColor: '#FFE6E6',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeCategoryIcon: {
    backgroundColor: '#fff',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryText: {
    fontWeight: '600',
    color: '#FF9999',
  },
  contentContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  exerciseIconContainer: {
    backgroundColor: '#FFE6E6',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    padding: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  exerciseDuration: {
    fontSize: 12,
    color: '#FF9999',
    fontWeight: '500',
  },
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  soundCard: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  soundIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  soundName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  storyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
  },
  storyInfo: {
    flex: 1,
    padding: 15,
  },
  storyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  storyDuration: {
    fontSize: 14,
    color: '#FF9999',
    fontWeight: '500',
  },
});

export default RelaxScreen;