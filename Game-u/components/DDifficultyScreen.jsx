import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground,
  Image
} from 'react-native';
import * as Haptics from '../utils/mock-haptics';

const DifficultyScreen = ({ onSelectDifficulty, onBack }) => {
  const handleSelect = (difficulty) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectDifficulty(difficulty);
  };

  return (
    <ImageBackground 
      source={require('./assets/images/ocean_background.jpg')} 
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Select Difficulty</Text>
        
        <View style={styles.difficultyContainer}>
          <TouchableOpacity 
            style={[styles.difficultyButton, styles.easyButton]} 
            onPress={() => handleSelect('easy')}
          >
            <Image 
              source={require('./assets/images/fish_icon.png')} 
              style={styles.difficultyIcon} 
            />
            <Text style={styles.difficultyText}>Easy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.difficultyButton, styles.mediumButton]} 
            onPress={() => handleSelect('medium')}
          >
            <Image 
              source={require('./assets/images/turtle_icon.png')} 
              style={styles.difficultyIcon} 
            />
            <Text style={styles.difficultyText}>Medium</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.difficultyButton, styles.hardButton]} 
            onPress={() => handleSelect('hard')}
          >
            <Image 
              source={require('./assets/images/shark_icon.png')} 
              style={styles.difficultyIcon} 
            />
            <Text style={styles.difficultyText}>Hard</Text>
            <Text style={styles.difficultyDescription}>6+ letter words</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>Back to Games</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontFamily: 'OpenDyslexic-Bold',
  },
  difficultyContainer: {
    width: '100%',
    alignItems: 'center',
  },
  difficultyButton: {
    width: '80%',
    height: 100,
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  easyButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  mediumButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
  },
  hardButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  difficultyIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  difficultyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'OpenDyslexic-Bold',
  },
  difficultyDescription: {
    fontSize: 14,
    color: 'white',
    marginLeft: 'auto',
    fontFamily: 'OpenDyslexic',
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic',
  },
});

export default DifficultyScreen;