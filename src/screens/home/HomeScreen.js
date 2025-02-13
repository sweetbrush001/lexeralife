import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Platform,
  ImageBackground, 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const HomeScreen = () => {
  const navigation = useNavigation();
  const progressValue = 30; // Example progress value

  return (
    <ImageBackground
      source={require('../../../assets/home_back.png')} // Add your background image
      style={styles.backgroundImage} // Style for full-screen background image
      resizeMode="cover" // Ensures the image covers the screen
    >
      <SafeAreaView style={styles.container}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/Logo.png')} // Make sure to add your logo
            style={styles.logo}
          />
          <Text style={styles.logoText}>Lexera Life</Text>
        </View>

        {/* Motivational Card */}
        <View style={styles.messageCard}>
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>
              <Text>It is more </Text>
              <Text style={styles.highlightRed}>common </Text>
              <Text>than you can </Text>
              <Text style={styles.highlightBrown}>imagine. </Text>
              <Text>You are not </Text>
              <Text style={styles.highlightRed}>alone.</Text>
            </Text>
          </View>

          {/* Profile Picture */}
          <Image
            source={require('../../../assets/profilepic.png')} // Replace with actual user profile image
            style={styles.profilePicture}
          />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{progressValue}% progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressValue}%` }]} />
            <View style={styles.progressDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureContainer}>
          <TouchableOpacity 
            style={[styles.featureCard, styles.botCard]}
            onPress={() => navigation.navigate('Chatbot')}
          >
            <Image
              source={require('../../../assets/g12.png')} // Add your bot image
              style={styles.botImage}
            />
            <Text style={styles.featureTitle}>Lexera Bot</Text>
          </TouchableOpacity>

          <View style={styles.smallCardsContainer}>
            <TouchableOpacity 
              style={[styles.smallCard, styles.trainingCard]}
              onPress={() => navigation.navigate('Game')}
            >
              <View style={styles.iconContainer}>
                <Icon name="brain" size={24} color="#FF9999" />
              </View>
              <Text style={styles.smallCardTitle}>Brain training</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.smallCard, styles.testCard]}
              onPress={() => navigation.navigate('Test')}
            >
              <View style={styles.iconContainer}>
                <Icon name="clipboard-check" size={24} color="#FF9999" />
              </View>
              <Text style={styles.smallCardTitle}>Dyslexia Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="home" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="microphone" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="user" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Ensures transparency for the background image
  },
  backgroundImage: {
    flex: 1, // Ensures the background image takes up the entire screen
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  logo: {
    width: 100,
    height: 50,
    marginRight: 18,
  },
  logoText: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  messageCard: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 100,
    position: 'relative', // Add relative positioning to allow profile picture placement
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 30,
    lineHeight: 32,
  },
  highlightRed: {
    color: '#FF4444',
  },
  highlightBrown: {
    color: '#8B4513',
  },
  progressContainer: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
  },
  progressText: {
    color: '#0066FF',
    fontSize: 16,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#0066FF',
    borderRadius: 4,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0066FF',
  },
  featureContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginRight: 10,
  },
  botCard: {
    flex: 1,
    justifyContent: 'space-between',
  },
  botImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
  },
  smallCardsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  smallCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  smallCardTitle: {
    fontSize: 16,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
  },
  navItem: {
    padding: 10,
  },
  navButton: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  profilePicture: {
    position: 'absolute',
    right: 1, // Adjust position from the right
    top: 15, // Adjust position from the top
    width: 100, // Set the size of the profile picture
    height: 100, // Set the size of the profile picture
    borderRadius: 25, // To make it circular
    borderWidth: 2,
    borderColor: '#fff', // Optional border color
    paddingLeft: 20,
  },
});

export default HomeScreen;
