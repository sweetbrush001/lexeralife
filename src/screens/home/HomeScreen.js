import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ImageBackground,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  BackHandler
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import TTSVoiceButton from '../../components/TTSVoiceButton';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig'; // Import from your config file

const { width } = Dimensions.get('window');
const PANEL_WIDTH = width * 0.8;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [motivationalTexts, setMotivationalTexts] = useState([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Animation value for side panel
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Close panel when back button is pressed
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isPanelOpen) {
          togglePanel();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isPanelOpen])
  );

  // Toggle side panel
  const togglePanel = () => {
    if (isPanelOpen) {
      // Close panel
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -PANEL_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsPanelOpen(false);
      });
    } else {
      // Open panel
      setIsPanelOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Handle menu item press
  const handleMenuItemPress = (screen) => {
    // First close the panel with animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -PANEL_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPanelOpen(false);
      
      // Then navigate or perform action
      if (screen === 'logout') {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', onPress: () => console.log('User logged out') },
        ]);
      } else if (screen === 'feedback') {
        Alert.alert('Feedback', 'Thank you for your interest in providing feedback!');
      } else {
        navigation.navigate(screen);
      }
    });
  };

  // Fetch motivational texts from Firebase
  const fetchMotivationalTexts = async () => {
    try {
      console.log("Starting to fetch motivational texts...");
      const querySnapshot = await getDocs(collection(db, "motivationalTexts"));
      const texts = [];
      
      querySnapshot.forEach((doc) => {
        console.log("Document data:", doc.data());
        if (doc.data().text) {
          texts.push(doc.data().text);
        }
      });
      
      console.log(`Found ${texts.length} motivational texts`);
      
      if (texts.length > 0) {
        setMotivationalTexts(texts);
      } else {
        // Fallback texts in case Firebase data is empty
        setMotivationalTexts([
          "Believe in yourself! Every great achievement starts with the decision to try.",
          "Don't stop when you're tired. Stop when you're done.",
          "Success comes from what you do consistently.",
          "Stay positive, work hard, make it happen."
        ]);
        console.log("Using fallback motivational texts");
      }
    } catch (error) {
      console.error("Error fetching motivational texts: ", error);
      // Show error alert or fallback to default texts
      Alert.alert("Data Loading Error", "Could not load motivational texts. Using defaults instead.");
      
      // Fallback texts
      setMotivationalTexts([
        "Believe in yourself! Every great achievement starts with the decision to try.",
        "Don't stop when you're tired. Stop when you're done.",
        "Success comes from what you do consistently.",
        "Stay positive, work hard, make it happen."
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchMotivationalTexts();
  }, []);

  // Set up interval to change text every 10 seconds
  useEffect(() => {
    // Always create the interval
    const interval = setInterval(() => {
      // Only update if we have texts
      if (motivationalTexts.length > 0) {
        setCurrentTextIndex((prevIndex) => 
          (prevIndex + 1) % motivationalTexts.length
        );
      }
    }, 60000);

    // Always return cleanup
    return () => clearInterval(interval);
  }, [motivationalTexts]);

  // Current text to display
  const currentMotivationalText = motivationalTexts[currentTextIndex] || "Loading inspiration...";

  return (
    <ImageBackground
      source={require('../../../assets/home_back.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <Image
              source={require('../../../assets/Logo.png')}
              style={styles.logo}
            />
            <Text style={styles.logoText}>Lexera Life</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={togglePanel}
          >
            <Icon name="bars" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Motivational Card with dynamic text from Firebase */}
        <View style={styles.messageCard}>
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>
              {loading ? "Loading inspiration..." : currentMotivationalText}
            </Text>
          </View>

          {/* Profile Picture */}
          <Image
            source={require('../../../assets/profilepic.png')}
            style={styles.profilePicture}
          />
        </View>

        {/* Feature Cards */}
        <View style={styles.featureContainer}>
          <TouchableOpacity 
            style={[styles.featureCard, styles.botCard]}
            onPress={() => navigation.navigate('Chatbot')}
          >
            <Image
              source={require('../../../assets/g12.png')}
              style={styles.botImage}
            />
            <Text style={styles.featureTitle}>Lexera Bot</Text>
          </TouchableOpacity>

          <View style={styles.smallCardsContainer}>
            <TouchableOpacity 
              style={[styles.smallCard, styles.trainingCard]}
              onPress={() => navigation.navigate('settings')}
            >
              <View style={styles.iconContainer}>
                <Icon name="brain" size={24} color="#FF9999" />
              </View>
              <Text style={styles.smallCardTitle}>Brain training</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.smallCard, styles.testCard]}
              onPress={() => navigation.navigate('TestIntro')}
            >
              <View style={styles.iconContainer}>
                <Icon name="clipboard-check" size={24} color="#FF9999" />
              </View>
              <Text style={styles.smallCardTitle}>Dyslexia Test</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.smallCard, styles.communityCard]}
              onPress={() => navigation.navigate('Community')}
            >
              <View style={styles.iconContainer}>
                <Icon name="users" size={24} color="#FF9999" />
              </View>
              <Text style={styles.smallCardTitle}>Community</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="home" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="user" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Draggable Voice Button */}
        <TTSVoiceButton />

        {/* Overlay when panel is open */}
        <Animated.View 
          style={[
            styles.overlay,
            { 
              opacity: overlayOpacity,
              pointerEvents: isPanelOpen ? 'auto' : 'none'
            }
          ]} 
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={togglePanel}
          />
        </Animated.View>

        {/* Side Panel */}
        <Animated.View 
          style={[
            styles.sidePanel,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <View style={styles.sidePanelContent}>
            <View style={styles.sidePanelHeader}>
              <View style={styles.profileSection}>
                <Image
                  source={require('../../../assets/profilepic.png')}
                  style={styles.sidePanelProfilePic}
                />
                <View style={styles.userInfoContainer}>
                  <Text style={styles.sidePanelUsername}>Alex Johnson</Text>
                  <Text style={styles.sidePanelEmail}>alex.johnson@example.com</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={togglePanel}
              >
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sidePanelMenu}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('profile')}
              >
                <View style={styles.menuIconContainer}>
                  <Icon name="user" size={20} color="#FF9999" />
                </View>
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('settings')}
              >
                <View style={styles.menuIconContainer}>
                  <Icon name="cog" size={20} color="#FF9999" />
                </View>
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('feedback')}
              >
                <View style={styles.menuIconContainer}>
                  <Icon name="comment-alt" size={20} color="#FF9999" />
                </View>
                <Text style={styles.menuItemText}>Feedback</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={[styles.menuItem, styles.logoutItem]}
                onPress={() => handleMenuItemPress('Auth')}
              >
                <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                  <Icon name="sign-out-alt" size={20} color="#fff" />
                </View>
                <Text style={styles.menuItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.sidePanelFooter}>
              <Text style={styles.versionText}>Lexera Life v1.0.2</Text>
              <Text style={styles.copyrightText}>© 2025 Lexera Life</Text>
            </View>
          </View>
        </Animated.View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
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
  menuButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageCard: {
    margin: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 20,
    position: 'relative',
    minHeight: 150,
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 120,
  },
  messageText: {
    fontSize: 22,
    lineHeight: 32,
    color: '#333',
    fontWeight: '500',
  },
  featureContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
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
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    flex: 1,
    justifyContent: 'space-between',
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
  profilePicture: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 100,
    height: 100,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  // Improved Side Panel Styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  overlayTouchable: {
    flex: 1,
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PANEL_WIDTH,
    height: '100%',
    zIndex: 1001,
    elevation: 10,
  },
  sidePanelContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  sidePanelHeader: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FFE6E6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidePanelProfilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfoContainer: {
    marginLeft: 15,
  },
  sidePanelUsername: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sidePanelEmail: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidePanelMenu: {
    padding: 15,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
    marginHorizontal: 10,
  },
  logoutItem: {
    backgroundColor: '#FFEFEF',
  },
  logoutIconContainer: {
    backgroundColor: '#FF4444',
  },
  sidePanelFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  }
});

export default HomeScreen;