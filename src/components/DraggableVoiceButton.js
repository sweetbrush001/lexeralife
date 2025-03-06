import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice'; // Changed to correct package
import { useTextReader } from '../context/TextReaderContext';

// Create a context for speech recognition to communicate with parent components
export const SpeechContext = React.createContext({
  transcription: '',
  setTranscription: () => {}
});

const DraggableVoiceButton = ({ onSpeechResult }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');
  const [transcript, setTranscript] = useState('');
  const fabAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  
  // Get text reader context for TTS
  const { getAllReadableText } = useTextReader();
  
  // Screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // Initialize Voice recognition
  useEffect(() => {
    // Set up voice listeners
    Voice.onSpeechStart = () => {
      console.log('Speech started');
    };
    Voice.onSpeechRecognized = () => {
      console.log('Speech recognized');
    };
    Voice.onSpeechEnd = () => {
      console.log('Speech ended');
      setIsListening(false);
    };
    Voice.onSpeechError = (error) => {
      console.error('Speech error:', error);
      setStatus('Error listening');
      setIsListening(false);
      setTimeout(() => setStatus(''), 2000);
    };
    Voice.onSpeechResults = (event) => {
      console.log('Speech results:', event.value);
      if (event.value && event.value[0]) {
        setTranscript(event.value[0]);
        
        // Call the callback with the transcript
        if (onSpeechResult) {
          onSpeechResult(event.value[0]);
        }
      }
    };
    
    // Clean up listeners on unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onSpeechResult]);
  
  // Initial positioning
  useEffect(() => {
    const initialX = screenWidth - 80;
    const initialY = screenHeight - 150;
    
    pan.setValue({ x: initialX, y: initialY });
  }, []);
  
  // Create PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
        
        // Button animation
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
        if (newY < 100) newY = 100; 
        if (newY > screenHeight - 100) newY = screenHeight - 100;
        
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          friction: 5
        }).start();
      }
    })
  ).current;
  
  // Stop any active functions (speaking or listening)
  const stopActiveFunction = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      setStatus('Stopped reading');
      setTimeout(() => setStatus(''), 1000);
      return true;
    }
    
    if (isListening) {
      await Voice.stop();
      setIsListening(false);
      setStatus('Stopped listening');
      setTimeout(() => setStatus(''), 1000);
      return true;
    }
    
    return false;
  };
  
  // Toggle FAB expansion or stop active function
  const handleButtonPress = async () => {
    // If speaking or listening, stop the active function
    const stopped = await stopActiveFunction();
    
    // If no function was stopped, toggle FAB
    if (!stopped) {
      toggleFAB();
    }
  };
  
  // Toggle FAB expansion
  const toggleFAB = () => {
    // Don't toggle if currently speaking or listening
    if (isSpeaking || isListening) return;
    
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
        easing: Easing.elastic(1.2),
      }).start();
    }
    setIsExpanded(!isExpanded);
  };

  // TTS (Text to Speech) function
  const activateTTS = async () => {
    // If already speaking, stop it
    if (isSpeaking) {
      await stopActiveFunction();
      return;
    }
    
    // Get text from context
    const textToRead = getAllReadableText();
    
    if (!textToRead || textToRead.trim() === '') {
      setStatus('No text to read');
      setTimeout(() => setStatus(''), 2000);
      return;
    }
    
    setStatus('Reading text...');
    setIsSpeaking(true);
    
    Speech.speak(textToRead, {
      language: 'en',
      pitch: 1.0,
      rate: 0.7, // Slightly slower for better comprehension
      onDone: () => {
        setIsSpeaking(false);
        setStatus('');
      },
      onStopped: () => {
        setIsSpeaking(false);
        setStatus('');
      },
      onError: (error) => {
        console.error('TTS error:', error);
        setIsSpeaking(false);
        setStatus('Error reading text');
      }
    });
    
    // Close menu after activation
    toggleFAB();
  };

  // STT (Speech to Text) function using Voice
  const activateSTT = async () => {
    try {
      // If already listening, stop it
      if (isListening) {
        await stopActiveFunction();
        return;
      }
      
      // Start listening
      setStatus('Listening...');
      setIsListening(true);
      setTranscript('');
      
      // Start the voice recognition
      await Voice.start('en-US');
      
      // Set a timeout to automatically stop listening after 10 seconds
      setTimeout(async () => {
        if (isListening) {
          try {
            await Voice.stop();
            setIsListening(false);
            setStatus('');
          } catch (error) {
            console.error('Error stopping voice recognition:', error);
          }
        }
      }, 10000);
    } catch (error) {
      console.error("Error with voice recognition:", error);
      setStatus('Voice recognition error');
      setTimeout(() => setStatus(''), 2000);
      setIsListening(false);
    }
    
    // Close menu after starting listening
    toggleFAB();
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
      style={[styles.container, { 
        transform: [
          { translateX: pan.x }, 
          { translateY: pan.y }, 
          { scale: scaleAnim }
        ] 
      }]}
      {...panResponder.panHandlers}
    >
      {/* TTS Option */}
      <Animated.View
        style={[
          styles.option, 
          styles.ttsOption, 
          { 
            opacity, 
            transform: [{ translateY: ttsTranslateY }], 
            zIndex: isExpanded ? 1 : -1 
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.optionButton, isSpeaking ? styles.activeOption : null]}
          onPress={activateTTS}
          activeOpacity={0.8}
        >
          <Icon name="volume-up" size={22} color="#fff" />
          <Text style={styles.optionText}>
            {isSpeaking ? "Stop Reading" : "Read Text"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* STT Option */}
      <Animated.View
        style={[
          styles.option, 
          styles.sttOption, 
          { 
            opacity, 
            transform: [{ translateY: sttTranslateY }], 
            zIndex: isExpanded ? 1 : -1 
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.optionButton, isListening ? styles.activeOption : null]}
          onPress={activateSTT}
          activeOpacity={0.8}
        >
          <Icon name="microphone" size={22} color="#fff" />
          <Text style={styles.optionText}>
            {isListening ? "Stop Listening" : "Voice Input"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Status Text */}
      {status ? (
        <Animated.View
          style={[styles.statusBubble, { 
            opacity: status ? 1 : 0, 
            transform: [{ translateY: -220 }]
          }]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </Animated.View>
      ) : null}

      {/* Main Button */}
      <TouchableOpacity
        style={[
          styles.fab, 
          isExpanded ? styles.fabActive : null, 
          isSpeaking ? styles.fabSpeaking : null,
          isListening ? styles.fabListening : null
        ]}
        onPress={handleButtonPress}
        activeOpacity={0.9}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Icon 
            name={isListening ? "microphone" : isSpeaking ? "volume-up" : "plus"} 
            size={24} 
            color="#fff" 
          />
        </Animated.View>
        {(isSpeaking || isListening) && (
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
    backgroundColor: '#A990FF', // Purple to match chat theme
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
    backgroundColor: '#9470FF',
  },
  fabSpeaking: {
    backgroundColor: '#44AAFF',
  },
  fabListening: {
    backgroundColor: '#FF9944',
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: 5,
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
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
    backgroundColor: '#A990FF',
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

