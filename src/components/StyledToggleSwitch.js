import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableWithoutFeedback, Animated, StyleSheet } from 'react-native';

/**
 * StyledToggleSwitch - A custom toggle switch styled after the provided CSS example
 * 
 * @param {boolean} value - The current state of the switch (on/off)
 * @param {function} onToggle - Callback function when the switch is toggled
 * @param {Object} containerStyle - Optional additional styling for the switch container
 */
const StyledToggleSwitch = ({ value, onToggle, containerStyle }) => {
  // Animation value for the knob position
  const translateX = useRef(new Animated.Value(value ? 24 : 0)).current;
  // Animation value for the rotation
  const rotation = useRef(new Animated.Value(value ? 0 : 270)).current;
  
  // Update animation when value changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: value ? 24 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: value ? 0 : 270,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [value, translateX, rotation]);

  // Convert rotation value to string for transform
  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  return (
    <TouchableWithoutFeedback onPress={onToggle}>
      <View style={[styles.switch, containerStyle, { backgroundColor: value ? '#21cc4c' : 'rgb(182, 182, 182)' }]}>
        <Animated.View 
          style={[
            styles.slider, 
            { 
              transform: [
                { translateX },
                { rotate: rotateInterpolate }
              ] 
            }
          ]}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  switch: {
    width: 56, // ~3.5em
    height: 32, // ~2em
    borderRadius: 10,
    position: 'relative',
    // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  slider: {
    position: 'absolute',
    width: 22.4, // ~1.4em
    height: 22.4, // ~1.4em
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    bottom: 4.8, // ~0.3em
    left: 4.8, // ~0.3em
    // Add shadow to slider for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  }
});

export default StyledToggleSwitch;
