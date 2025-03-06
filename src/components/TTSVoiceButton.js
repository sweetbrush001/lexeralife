import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as Speech from 'expo-speech'; // For Text-to-Speech
import { useTextReader } from '../context/TextReaderContext';

const TTSVoiceButton = () => {
  const { getAllReadableText } = useTextReader();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current; // scale animation
  const pan = useRef(new Animated.ValueXY()).current; // pan for drag
  
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
      onStartShouldSetPanResponder: () => true, // Always start drag
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only recognize as drag if moved more than 10 units
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
        
        // Button press animation (scale effect)
        Animated.sequence([ 
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
          })
        ]).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        
        // Add boundary checks
        let newX = pan.x._value;
        let newY = pan.y._value;
        
        // Ensure button stays within screen bounds
        if (newX < 0) newX = 0;
        if (newX > screenWidth - 70) newX = screenWidth - 70;
        if (newY < 100) newY = 100; // Avoid top area
        if (newY > screenHeight - 100) newY = screenHeight - 100;
        
        // Animate to the bounded position
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          friction: 5
        }).start();
      }
    })
  ).current;
  
  // TTS (Text to Speech) function - memoize to prevent recreations
  const activateTTS = useCallback(() => {
    if (isSpeaking) {
      // Stop speaking
      Speech.stop();
      setIsSpeaking(false);
      setStatus('');
    } else {
        // Get text from context
      const textToRead = getAllReadableText();
      
      if (!textToRead || textToRead.trim() === '') {
        setStatus('No readable text found');
        setTimeout(() => setStatus(''), 2000);
        return;
      }
      
      setStatus('Reading text...');
      setIsSpeaking(true);
      
      Speech.speak(textToRead, {
        language: 'en',
        pitch: 1.1,
        rate: 0.6, // Slightly slower for better comprehension
        onDone: () => {
          setIsSpeaking(false);
          setStatus('');
        },
        onStopped: () => {
          setIsSpeaking(false);
          setStatus('');
        },
        onError: () => {
          setIsSpeaking(false);
          setStatus('Error with text-to-speech');
        }
      });
    }
  }, [isSpeaking, getAllReadableText]);

  return (
    <Animated.View
      style={[styles.container, {
        left: 0,
        top: 0,
        transform: [
          { translateX: pan.x },
          { translateY: pan.y },
          { scale: scaleAnim }
        ]
      }]}
      {...panResponder.panHandlers}
    >
      {/* Status Text */}
      {status ? (
        <Animated.View
          style={[styles.statusBubble, {
            opacity: status ? 1 : 0,
            transform: [{ translateY: -80 }]
          }]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </Animated.View>
      ) : null}

      {/* Main Button */}
      <TouchableOpacity
        style={[styles.fab, isSpeaking ? styles.fabSpeaking : null]}
        onPress={activateTTS}
        activeOpacity={0.9}
      >
        <Icon 
          name="volume-up" 
          size={24} 
          color="#fff" 
          style={isSpeaking ? { opacity: 0.8 } : null}
        />
        {isSpeaking && (
          <Text style={styles.speakingIndicator}>•</Text>
        )}
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
  fabSpeaking: {
    backgroundColor: '#44AAFF',
    borderColor: '#fff',
    borderWidth: 2,
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
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: 5,
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  }
});

// Memoize the component to prevent unnecessary re-renders
export default React.memo(TTSVoiceButton);
