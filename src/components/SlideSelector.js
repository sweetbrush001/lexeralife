import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * SlideSelector - A custom sliding selector component with animated selection indicator
 * 
 * @param {array} options - Array of options to display [{label, value}]
 * @param {any} value - Currently selected value
 * @param {function} onChange - Callback when option changes
 * @param {object} style - Optional container style
 */
const SlideSelector = ({ options, value, onChange, style }) => {
  // Animation value for sliding effect
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate the position based on the selected value
  useEffect(() => {
    const selectedIndex = options.findIndex(option => option.value === value);
    if (selectedIndex !== -1) {
      Animated.timing(slideAnim, {
        toValue: selectedIndex,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [value, options, slideAnim]);
  
  // Option item width calculation
  const optionWidth = width / options.length - 24; // Adjust for margins
  
  return (
    <View style={[styles.container, style]}>
      {/* Background container */}
      <View style={styles.sliderContainer}>
        {/* Animated sliding indicator */}
        <Animated.View 
          style={[
            styles.slideBar, 
            { 
              width: optionWidth,
              transform: [{ 
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0, optionWidth, optionWidth * 2]
                }) 
              }]
            }
          ]}
        >
          {/* Top and bottom bar accents */}
          <View style={styles.barAccentTop} />
          <View style={styles.barAccentBottom} />
        </Animated.View>
        
        {/* Options */}
        {options.map((option, index) => (
          <Pressable
            key={option.value}
            style={[
              styles.optionButton,
              { width: optionWidth }
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[
              styles.optionLabel,
              value === option.value && styles.selectedOptionLabel
            ]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
    alignItems: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  slideBar: {
    position: 'absolute',
    backgroundColor: '#21cc4c', // Green color for active state
    borderRadius: 8,
    top: 4,
    bottom: 4,
    left: 4,
    height: '100%',
    zIndex: 1,
  },
  barAccentTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#19a53a', // Darker green for top accent
    borderTopLeftRadius: 8, 
    borderTopRightRadius: 8,
  },
  barAccentBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#19a53a', // Darker green for bottom accent
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  optionButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  optionLabel: {
    fontWeight: '500',
    fontSize: 16,
    color: '#555555',
  },
  selectedOptionLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SlideSelector;
