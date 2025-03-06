import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Animated, 
  Easing,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

/**
 * FancyRadioGroup - A neumorphic styled radio group with animations
 * 
 * @param {array} options - Array of options [{label, value}]
 * @param {any} value - Currently selected value
 * @param {function} onChange - Function called when selection changes
 * @param {object} style - Optional additional styling
 */
const FancyRadioGroup = ({ options, value, onChange, style }) => {
  const [selectedValue, setSelectedValue] = useState(value);
  const [animations, setAnimations] = useState({});
  const [rippleAnimations, setRippleAnimations] = useState({});
  const [sparkleAnimations, setSparkleAnimations] = useState({});

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Initialize animations for each option
  useEffect(() => {
    const newAnimations = {};
    const newRipples = {};
    const newSparkles = {};
    
    options.forEach(option => {
      newAnimations[option.value] = {
        scale: new Animated.Value(option.value === value ? 1 : 0.95),
        translateY: new Animated.Value(option.value === value ? 2 : 0),
      };
      
      newRipples[option.value] = {
        scale: new Animated.Value(0.2),
        opacity: new Animated.Value(0),
      };
      
      newSparkles[option.value] = {
        scale: new Animated.Value(0.2),
        opacity: new Animated.Value(0),
      };
    });
    
    setAnimations(newAnimations);
    setRippleAnimations(newRipples);
    setSparkleAnimations(newSparkles);
  }, [options]);

  // Run animation when selection changes
  const handleSelect = (optionValue) => {
    // First update state and call onChange
    setSelectedValue(optionValue);
    onChange(optionValue);
    
    // Then run animations for selected item
    if (animations[optionValue]) {
      // Selection animation
      Animated.sequence([
        Animated.timing(animations[optionValue].scale, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(animations[optionValue].scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
      ]).start();
      
      Animated.timing(animations[optionValue].translateY, {
        toValue: 2,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Ripple effect
      Animated.sequence([
        Animated.timing(rippleAnimations[optionValue].opacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(rippleAnimations[optionValue].scale, {
            toValue: 2.5,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(rippleAnimations[optionValue].opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]),
        Animated.timing(rippleAnimations[optionValue].scale, {
          toValue: 0.2,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Sparkle animation
      Animated.sequence([
        Animated.timing(sparkleAnimations[optionValue].opacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(sparkleAnimations[optionValue].scale, {
            toValue: 2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnimations[optionValue].opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(sparkleAnimations[optionValue].scale, {
          toValue: 0.2,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Reset other items
    Object.keys(animations).forEach(key => {
      if (key !== optionValue && animations[key]) {
        Animated.timing(animations[key].translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        
        Animated.timing(animations[key].scale, {
          toValue: 0.95,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#e6e6e6', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.radioGroup}
      >
        {options.map((option, index) => (
          <Pressable
            key={option.value}
            style={[
              styles.radioOption,
              { width: (width - 88) / options.length },
            ]}
            onPress={() => handleSelect(option.value)}
          >
            {/* Radio button */}
            <Animated.View
              style={[
                styles.radioButton,
                selectedValue === option.value ? styles.radioButtonSelected : null,
                animations[option.value] ? {
                  transform: [
                    { scale: animations[option.value].scale },
                    { translateY: animations[option.value].translateY }
                  ]
                } : null
              ]}
            >
              {/* Ripple effect */}
              {rippleAnimations[option.value] && (
                <Animated.View
                  style={[
                    styles.rippleEffect,
                    {
                      opacity: rippleAnimations[option.value].opacity,
                      transform: [{ scale: rippleAnimations[option.value].scale }],
                    },
                  ]}
                />
              )}
              
              {/* Sparkle effect */}
              {sparkleAnimations[option.value] && selectedValue === option.value && (
                <Animated.View
                  style={[
                    styles.sparkleEffect,
                    {
                      opacity: sparkleAnimations[option.value].opacity,
                      transform: [{ scale: sparkleAnimations[option.value].scale }],
                    },
                  ]}
                />
              )}
              
              {/* Content with gradient */}
              <LinearGradient
                colors={
                  selectedValue === option.value 
                    ? ['#3b82f6', '#2563eb']
                    : ['#ffffff', '#e6e6e6']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.radioContent,
                  selectedValue === option.value ? styles.radioContentSelected : null,
                ]}
              >
                {option.swatch && (
                  <View 
                    style={[styles.colorSwatch, { backgroundColor: option.value }]} 
                  />
                )}
                <Text 
                  style={[
                    styles.radioLabel, 
                    selectedValue === option.value ? styles.radioLabelSelected : null
                  ]}
                >
                  {option.label}
                </Text>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        ))}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    backgroundColor: '#e6e6e6',
  },
  radioOption: {
    flex: 1,
    marginHorizontal: 4,
    height: 44,
    position: 'relative',
    overflow: 'visible',
  },
  radioButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  radioButtonSelected: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  radioContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 8,
  },
  radioContentSelected: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  radioLabel: {
    color: '#2d3748',
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center',
  },
  radioLabelSelected: {
    color: 'white',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  rippleEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 1,
  },
  sparkleEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    zIndex: 2,
  },
});

export default FancyRadioGroup;
