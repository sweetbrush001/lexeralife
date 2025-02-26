import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Easing  // Add this import
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as Speech from 'expo-speech'; // For Text-to-Speech
import { Audio } from 'expo-av'; // For Audio/Voice recording

const DraggableVoiceButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [transcription, setTranscription] = useState('');
  const fabAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  
  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // Initial positioning in bottom right
  useEffect(() => {
    const initialX = screenWidth - 80;
    const initialY = screenHeight - 150;
    
    pan.setValue({ x: initialX, y: initialY });
  }, []); // Empty dependency array ensures it only runs once
  
  // Create the PanResponder to handle dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only recognize as drag if moved more than 10 units
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        // Store the initial position when the drag starts
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        // Reset the gesture value
        pan.setValue({ x: 0, y: 0 });
        
        // Button press animation - useNativeDriver is set to false
        Animated.sequence([ 
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: false, // Make sure useNativeDriver is false for layout-related properties
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false, // Make sure useNativeDriver is false for layout-related properties
          })
        ]).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false } // Ensure useNativeDriver is false for pan-based gestures
      ),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        
        let newX = pan.x._value;
        let newY = pan.y._value;
        
        // Ensure button stays within screen bounds
        if (newX < 0) newX = 0;
        if (newX > screenWidth - 70) newX = screenWidth - 70;
        if (newY < 100) newY = 100; // Avoid top area
        if (newY > screenHeight - 100) newY = screenHeight - 100;
        
        // Update the position state and animate to it
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false, // Use Native Driver false for layout properties
          friction: 5
        }).start();
      }
    })
  ).current;
  
  // Toggle FAB state
  const toggleFAB = () => {
    if (isExpanded) {
      Animated.timing(fabAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.back(1.5)),
      }).start();
    } else {
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.elastic(1.2), // Make sure this is the correct method name
      }).start();
    }
    setIsExpanded(!isExpanded);
  };

  // TTS (Text to Speech) function with actual implementation
  const activateTTS = () => {
    const demoText = "Welcome to Lexera Life. I'm here to help you navigate your dyslexia journey.";
    Speech.speak(demoText, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9, // Slightly slower for better comprehension
    });
    // Close menu after activation
    toggleFAB();
  };

  // STT (Speech to Text) function with actual implementation
  const activateSTT = async () => {
    try {
      if (isListening) {
        // Stop listening logic
        setIsListening(false);
        setStatus('');
      } else {
        // Start listening
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          setStatus('Permission to access microphone is required!');
          return;
        }

        setStatus('Listening...');
        setIsListening(true);
        
        // Simulate STT with a timeout
        setTimeout(() => {
          setIsListening(false);
          setStatus('');
          toggleFAB(); // Close menu after completion
        }, 5000);
      }
    } catch (error) {
      console.error("Error with speech recognition:", error);
      setStatus('Error with speech recognition');
      setIsListening(false);
    }
  };

  // Animated values for expanded options
  const ttsTranslateY = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -90]
  });
  
  const sttTranslateY = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -170]
  });
  
  const rotation = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  const opacity = fabAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1]
  });

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale: scaleAnim }] }]}
      {...panResponder.panHandlers}
    >
      {/* TTS Option */}
      <Animated.View
        style={[styles.option, styles.ttsOption, { opacity, transform: [{ translateY: ttsTranslateY }], zIndex: isExpanded ? 1 : -1 }]}
      >
        <TouchableOpacity
          style={styles.optionButton}
          onPress={activateTTS}
          activeOpacity={0.8}
        >
          <Icon name="volume-up" size={22} color="#fff" />
          <Text style={styles.optionText}>Read Text</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* STT Option */}
      <Animated.View
        style={[styles.option, styles.sttOption, { opacity, transform: [{ translateY: sttTranslateY }], zIndex: isExpanded ? 1 : -1 }]}
      >
        <TouchableOpacity
          style={[styles.optionButton, isListening ? styles.activeOption : null]}
          onPress={activateSTT}
          activeOpacity={0.8}
        >
          <Icon name="microphone" size={22} color="#fff" style={isListening ? { opacity: 0.7 } : null} />
          <Text style={styles.optionText}>
            {isListening ? "Listening..." : "Voice Input"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Status Text (for STT) */}
      {status ? (
        <Animated.View
          style={[styles.statusBubble, { opacity: isListening ? 1 : 0, transform: [{ translateY: -220 }]}]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </Animated.View>
      ) : null}

      {/* Main Button */}
      <TouchableOpacity
        style={[styles.fab, isExpanded ? styles.fabActive : null, isListening ? styles.fabListening : null]}
        onPress={toggleFAB}
        activeOpacity={0.9}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Icon name={isListening ? "microphone" : "plus"} size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  fab: {
    backgroundColor: '#FF6D6D',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 999,
    borderWidth: 2,
    borderColor: '#fff',
  },
  fabActive: {
    backgroundColor: '#FF4444',
  },
  fabListening: {
    backgroundColor: '#44AAFF',
    borderColor: '#fff',
    borderWidth: 2,
  },
  option: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6D6D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    borderWidth: 1,
    borderColor: '#fff',
    minWidth: 140,
    justifyContent: 'center',
  },
  activeOption: {
    backgroundColor: '#44AAFF',
    borderColor: '#fff',
    borderWidth: 2,
  },
  ttsOption: {
    zIndex: 2,
  },
  sttOption: {
    zIndex: 3,
  },
  optionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  statusBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 1000,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  }
});

export default DraggableVoiceButton;

