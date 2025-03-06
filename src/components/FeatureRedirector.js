import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { 
  hasSeenFeatureIntro, 
  isNewUser, 
  debugAsyncStorage 
} from '../utils/FeatureIntroUtils';

/**
 * A component that redirects users to either an intro screen or feature screen
 * based on whether they have seen the intro before
 */
const FeatureRedirector = ({ route, navigation }) => {
  const [status, setStatus] = useState('Checking feature status...');
  const { featureKey, introRoute, featureRoute, isNewUser: passedIsNewUser } = route.params || {};

  useEffect(() => {
    const checkAndNavigate = async () => {
      try {
        console.log(`[FeatureRedirector] Starting for ${featureKey}`);
        console.log(`[FeatureRedirector] Options: intro=${introRoute}, feature=${featureRoute}`);
        
        // Debug what's currently in AsyncStorage
        await debugAsyncStorage();

        // First check if user param explicitly says this is a new user
        if (passedIsNewUser) {
          console.log('[FeatureRedirector] Navigation params indicate NEW user');
          setStatus(`New user detected! Redirecting to ${introRoute}...`);
          setTimeout(() => navigation.replace(introRoute), 300);
          return;
        }

        // Then check AsyncStorage if this is a new user
        const userIsNew = await isNewUser();
        if (userIsNew) {
          console.log('[FeatureRedirector] AsyncStorage indicates NEW user');
          setStatus(`New user! Redirecting to ${introRoute}...`);
          setTimeout(() => navigation.replace(introRoute), 300);
          return;
        }

        // Not a new user, check if they've seen this specific intro
        setStatus(`Checking if you've seen the ${featureKey} intro...`);
        const hasSeen = await hasSeenFeatureIntro(featureKey);
        
        // Navigate based on whether they've seen the intro
        const targetRoute = hasSeen ? featureRoute : introRoute;
        console.log(`[FeatureRedirector] Has seen ${featureKey}? ${hasSeen ? 'YES' : 'NO'}`);
        console.log(`[FeatureRedirector] Redirecting to ${targetRoute}`);
        
        setStatus(`Redirecting to ${targetRoute}...`);
        setTimeout(() => navigation.replace(targetRoute), 300);
        
      } catch (error) {
        console.error('[FeatureRedirector] Error:', error);
        setStatus('Error occurred. Redirecting to feature...');
        
        // In case of any error, default to the feature route
        setTimeout(() => navigation.replace(featureRoute), 800);
      }
    };
    
    if (featureKey && introRoute && featureRoute) {
      checkAndNavigate();
    } else {
      console.error('[FeatureRedirector] Missing required parameters');
      setStatus('Error: Missing parameters');
      
      // Navigate back to home if parameters are missing
      setTimeout(() => navigation.goBack(), 1000);
    }
  }, [featureKey, introRoute, featureRoute, navigation, passedIsNewUser]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B6B" style={styles.spinner} />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  text: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 40,
  }
});

export default FeatureRedirector;
