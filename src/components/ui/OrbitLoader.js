import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const OrbitLoader = ({ size = 45, color = '#0066FF', speed = 2500 }) => {
  // Create refs for animations
  const animatedValues = useRef(Array(12).fill().map(() => new Animated.Value(0))).current;
  
  useEffect(() => {
    // Create animations for each dot
    const animations = animatedValues.map((value, index) => {
      // Calculate delay based on position (similar to CSS animation-delay)
      const delay = index % 2 === 0 ? 0 : speed / -2;
      const additionalDelay = Math.floor(index / 2) * (speed / -6);
      const totalDelay = delay + additionalDelay;
      
      // Create looping animation
      return Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration: speed,
          delay: Math.abs(totalDelay) % speed,
          useNativeDriver: true,
          easing: t => t, // Linear easing
        })
      );
    });
    
    // Start all animations
    Animated.parallel(animations).start();
    
    // Clean up animations on unmount
    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [speed]);
  
  // Create the six slices with their animated dots
  const slices = [];
  for (let i = 0; i < 6; i++) {
    const dotLeft = animatedValues[i * 2];
    const dotRight = animatedValues[i * 2 + 1];
    
    slices.push(
      <View key={i} style={[styles.slice, { height: size / 6 }]}>
        <Animated.View 
          style={[
            styles.dot, 
            { 
              backgroundColor: color,
              width: size / 12,
              height: '100%',
              left: '50%',
              marginLeft: -size / 24,
              transform: [
                {
                  translateX: dotLeft.interpolate({
                    inputRange: [0, 0.25, 0.5, 0.75, 1],
                    outputRange: [size * 0.25, 0, -size * 0.25, 0, size * 0.25]
                  })
                },
                {
                  scale: dotLeft.interpolate({
                    inputRange: [0, 0.25, 0.5, 0.75, 1],
                    outputRange: [0.73, 0.47, 0.73, 1, 0.73]
                  })
                }
              ],
              opacity: dotLeft.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0.65, 0.3, 0.65, 1, 0.65]
              })
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.dot, 
            { 
              backgroundColor: color,
              width: size / 12,
              height: '100%',
              left: '50%',
              marginLeft: -size / 24,
              transform: [
                {
                  translateX: dotRight.interpolate({
                    inputRange: [0, 0.25, 0.5, 0.75, 1],
                    outputRange: [size * 0.25, 0, -size * 0.25, 0, size * 0.25]
                  })
                },
                {
                  scale: dotRight.interpolate({
                    inputRange: [0, 0.25, 0.5, 0.75, 1],
                    outputRange: [0.73, 0.47, 0.73, 1, 0.73]
                  })
                }
              ],
              opacity: dotRight.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0.65, 0.3, 0.65, 1, 0.65]
              })
            }
          ]}
        />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { height: size, width: size }]}>
      {slices}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slice: {
    position: 'relative',
    width: '100%',
  },
  dot: {
    position: 'absolute',
    borderRadius: 50,
  }
});

export default OrbitLoader;