import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Auth'); // Navigate to Auth after animation completes
    }, 3000); // Duration of the animation (in ms)

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/Splash_screen.json')} // Path to your Lottie JSON file
        autoPlay
        loop={true} // Set to true if you want the animation to repeat
        speed={1} // Control the speed of the animation (1 is normal speed)
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  animation: {
    width: 200, // Adjust size as needed
    height: 200,
  },
});

export default SplashScreen;
