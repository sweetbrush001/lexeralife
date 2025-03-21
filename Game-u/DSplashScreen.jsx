// DSplashScreen.jsx
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  StyleSheet,
  Text
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Change the component name to match the export
const DSplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const animation = useRef(null);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      })
    ]).start();

    // Play lottie animation
    if (animation.current) {
      animation.current.play();
    }

    // Navigate to next screen after delay
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground 
      source={require('./assets/images/space_background.jpg')} 
      style={styles.container}
    >
          
      <Animated.View 
        style={[
          styles.titleContainer, 
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Text style={styles.title}>Ocean Spelling</Text>
        <Text style={styles.subtitle}>Adventure</Text>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: width * 0.7,
    height: height * 0.7,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#FFF',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  }
});

export default DSplashScreen;