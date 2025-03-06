import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getAuth } from 'firebase/auth';
// Import TextReaderRoot and ReadableText
import TextReaderRoot from '../../components/TextReaderRoot';
import ReadableText from '../../components/ReadableText';
// Import the SidePanel component
import SidePanel from '../../components/SidePanel';
// Import our custom hooks
import { useFirebaseData, useUserData } from '../../hooks/useFirebaseData';
// Import ProfileImage component
import ProfileImage from '../../components/ProfileImage';

// Modern icon libraries
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = width * 0.8;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Animation value for side panel
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Use our custom hooks for data fetching
  const { userData, loading: userLoading } = useUserData();
  const { data: motivationalData, loading: textsLoading, error: textsError } = 
    useFirebaseData("motivationalTexts");

  // Transform the Firestore data into a simple array of texts
  const motivationalTexts = useMemo(() => {
    if (!motivationalData) return [];
    return motivationalData.map(item => item.text).filter(Boolean);
  }, [motivationalData]);

  // Fallback texts in case Firebase data is empty or has an error
  const fallbackTexts = useMemo(() => [
    "Believe in yourself! Every great achievement starts with the decision to try.",
    "Don't stop when you're tired. Stop when you're done.",
    "Success comes from what you do consistently.",
    "Stay positive, work hard, make it happen."
  ], []);

  // Determine which texts to use (from Firebase or fallbacks)
  const textsToUse = useMemo(() => {
    if (textsError || !motivationalTexts || motivationalTexts.length === 0) {
      return fallbackTexts;
    }
    return motivationalTexts;
  }, [motivationalTexts, fallbackTexts, textsError]);

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

  // Set up interval to change text every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (textsToUse.length > 0) {
        setCurrentTextIndex((prevIndex) => 
          (prevIndex + 1) % textsToUse.length
        );
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [textsToUse]);

  // Memoize toggle panel function to prevent unnecessary re-renders
  const togglePanel = useCallback(() => {
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
  }, [isPanelOpen, slideAnim, overlayOpacity]);

  // Handle logout
  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => {
          const auth = getAuth();
          auth.signOut()
            .then(() => navigation.navigate('Auth'))
            .catch((error) => console.error("Error signing out: ", error));
        }
      },
    ]);
  }, [navigation]);

  // Current text to display
  const currentMotivationalText = textsToUse[currentTextIndex] || "Loading inspiration...";

  // Get profile image source
  const profileImageSource = useMemo(() => {
    if (!userData) return null;
    return userData.photoURL ? { uri: userData.photoURL } : null;
  }, [userData]);

  return (
    <TextReaderRoot>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        
        {/* Modern App Header */}
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <Image
              source={require('../../../assets/Logo.png')}
              style={styles.logo}
            />
            <ReadableText style={styles.logoText} readable={false}>
              Lexera Life
            </ReadableText>
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={togglePanel}
          >
            <Feather name="menu" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        {/* User Welcome Section - READ WITH PRIORITY 1 */}
        <View style={styles.welcomeSection}>
          <View style={styles.userInfoSection}>
            <ReadableText style={styles.welcomeText} readable={true} priority={1}>
              Hello,
            </ReadableText>
            <ReadableText style={styles.userName} readable={true} priority={2}>
              {userLoading ? 'Loading...' : (userData ? userData.displayName : 'Lexera User')}
            </ReadableText>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('profile')}
          >
            {userLoading ? (
              <ActivityIndicator color="#FF6B6B" size="small" />
            ) : (
              <ProfileImage 
                source={profileImageSource} 
                style={styles.profilePicture} 
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Motivational Card - READ WITH PRIORITY 3 */}
        <LinearGradient
          colors={['#FF9F9F', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.messageCard}
        >
          {textsLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <ReadableText style={styles.messageText} readable={true} priority={3}>
              {currentMotivationalText}
            </ReadableText>
          )}
        </LinearGradient>

        {/* Features heading - not read */}
        <ReadableText style={styles.sectionTitle} readable={false}>
          Features
        </ReadableText>
        
        <View style={styles.featureGrid}>
          {/* Row 1 */}
          <View style={styles.featureRow}>
            <TouchableOpacity 
              style={[styles.featureCard, styles.primaryCard]}
              onPress={() => navigation.navigate('Chatbot')}
            >
              <BlurView intensity={10} style={styles.cardBlur}>
                <MaterialCommunityIcons name="robot" size={28} color="#FF6B6B" />
                <ReadableText style={styles.featureTitle} readable={true} priority={4}>
                  Lexera Bot
                </ReadableText>
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureCard, styles.secondaryCard]}
              onPress={() => navigation.navigate('Guide')}
            >
              <BlurView intensity={10} style={styles.cardBlur}>
                <MaterialCommunityIcons name="brain" size={28} color="#FF6B6B" />
                <ReadableText style={styles.featureTitle} readable={true} priority={5}>
                  Brain Training
                </ReadableText>
              </BlurView>
            </TouchableOpacity>
          </View>
          
          {/* Row 2 */}
          <View style={styles.featureRow}>
            <TouchableOpacity 
              style={[styles.featureCard, styles.secondaryCard]}
              onPress={() => navigation.navigate('Teststarting')}
            >
              <BlurView intensity={10} style={styles.cardBlur}>
                <Feather name="clipboard" size={28} color="#FF6B6B" />
                <ReadableText style={styles.featureTitle} readable={true} priority={6}>
                  Dyslexia Test
                </ReadableText>
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureCard, styles.primaryCard]}
              onPress={() => navigation.navigate('Relax')}
            >
              <BlurView intensity={10} style={styles.cardBlur}>
                <Feather name="heart" size={28} color="#FF6B6B" />
                <ReadableText style={styles.featureTitle} readable={true} priority={7}>
                  Relax
                </ReadableText>
              </BlurView>
            </TouchableOpacity>
          </View>
          
          {/* Community Card (Full Width) */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.fullWidthCard]}
            onPress={() => navigation.navigate('Community')}
          >
            <BlurView intensity={10} style={styles.cardBlur}>
              <Feather name="users" size={28} color="#FF6B6B" />
              <ReadableText style={styles.featureTitle} readable={true} priority={8}>
                Community
              </ReadableText>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Side Panel Component */}
        <SidePanel 
          isOpen={isPanelOpen}
          slideAnim={slideAnim}
          overlayOpacity={overlayOpacity}
          togglePanel={togglePanel}
          currentUser={userData}
          navigation={navigation}
          handleLogout={handleLogout}
        />
      </SafeAreaView>
    </TextReaderRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  userInfoSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#757575',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  messageCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    minHeight: 120,
    position: 'relative',
  },
  messageText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#fff',
    fontWeight: '500',
  },
  featureGrid: {
    paddingHorizontal: 20,
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  featureCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardBlur: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  primaryCard: {
    width: '48%',
    height: 120,
    backgroundColor: '#FAF3F0',
  },
  secondaryCard: {
    width: '48%',
    height: 120,
    backgroundColor: '#FFFFFF',
  },
  fullWidthCard: {
    width: '100%',
    height: 100,
    marginBottom: 15,
    backgroundColor: '#F8E8E8',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  // Removed the side panel styles since they're now in the SidePanel component
});

export default HomeScreen;