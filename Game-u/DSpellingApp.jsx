import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from './utils/mock-haptics';

const { width, height } = Dimensions.get('window');

// Game data - hardcoded for now
const GAME_DATA = {
  easy: [
    { word: 'fish', image: require('./assets/images/fish.png'), hint: 'It swims in the ocean' },
    { word: 'crab', image: require('./assets/images/crab.png'), hint: 'It has pincers and walks sideways' },
    { word: 'shark', image: require('./assets/images/shark.png'), hint: 'A predator with sharp teeth' },
    { word: 'wave', image: require('./assets/images/wave.png'), hint: 'Ocean water in motion' },
    { word: 'boat', image: require('./assets/images/boat.png'), hint: 'It floats on water' },
  ],
  medium: [
    { word: 'starfish', image: require('./assets/images/starfish.png'), hint: 'A five-pointed sea creature' },
    { word: 'whale', image: require('./assets/images/whale.png'), hint: 'The largest mammal in the sea' },
    { word: 'coral', image: require('./assets/images/coral.png'), hint: 'Colorful underwater structures' },
    { word: 'seashell', image: require('./assets/images/shell.png'), hint: 'A hard protective covering' },
    { word: 'squid', image: require('./assets/images/squid.png'), hint: 'Has tentacles and can spray ink' },],
  hard: [
    { word: 'turtle', image: require('./assets/images/turtle.png'), hint: 'A reptile with a shell' },
    { word: 'octopus', image: require('./assets/images/octopus.png'), hint: 'Has eight arms' },
    { word: 'dolphin', image: require('./assets/images/dolphin.png'), hint: 'An intelligent marine mammal' },
    { word: 'jellyfish', image: require('./assets/images/jellyfish.png'), hint: 'It can sting' },
    { word: 'seahorse', image: require('./assets/images/seahorse.png'), hint: 'Swims upright' },]
};

// Sounds
const SOUNDS = {
  correct: require('./assets/sounds/correct.mp3'),
  wrong: require('./assets/sounds/incorrect.mp3'),
  drop: require('./assets/sounds/drop.mp3'),
  complete: require('./assets/sounds/correct.mp3'),
  background: require('./assets/sounds/ocean-ambience.mp3'),
};

const DSpellingGame = ({ onBackToHome }) => {
  const [gameState, setGameState] = useState('splash'); // 'splash', 'difficulty', 'game', 'summary'
  const [difficulty, setDifficulty] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [currentHint, setCurrentHint] = useState('');
  const [letters, setLetters] = useState([]);
  const [blanks, setBlanks] = useState([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [backgroundSound, setBackgroundSound] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [revealedHint, setRevealedHint] = useState('');
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [letterContainerPosition, setLetterContainerPosition] = useState(null);
  const [droppedLetters, setDroppedLetters] = useState([]); // Store letters that have been placed in blanks
  const [letterPlaygroundLayout, setLetterPlaygroundLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [availableWords, setAvailableWords] = useState([]); // Add this state for tracking available words
  const [blankPositions, setBlankPositions] = useState({}); // Add this state for tracking blank positions

  const animation = useRef(null);
  const correctAnimation = useRef(null);
  const wrongAnimation = useRef(null);
  const splashAnimation = useRef(null);

  // Initialize splash screen
  useEffect(() => {
    if (gameState === 'splash' && splashAnimation.current) {
      splashAnimation.current.play();

      // Navigate to difficulty screen after delay 

      const timer = setTimeout(() => {
        setGameState('difficulty');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [gameState, splashAnimation]);

  // Initialize game when difficulty is selected
  useEffect(() => {
    if (gameState === 'game') {
      // Reset gameOver flag when starting a new game
      setGameOver(false);

      // Important change: Use the game data directly in setupGame instead of relying on availableWords state
      const wordsForThisDifficulty = [...GAME_DATA[difficulty]];

      // Call a modified setupGame that uses the words directly
      setTimeout(() => {
        // Pass the words directly to avoid state timing issues
        setupGameWithWords(wordsForThisDifficulty);
      }, 300);

      playBackgroundMusic();
    }

    return () => {
      if (backgroundSound) {
        backgroundSound.unloadAsync();
      }
    };
  }, [difficulty, gameState]);


  // Check if word is complete to show submit button
  useEffect(() => {
    if (gameState === 'game') {
      const isAnyBlankFilled = blanks.some(blank => blank.filled);
      setShowSubmitButton(isAnyBlankFilled);
    }
  }, [blanks, gameState]);

  const playBackgroundMusic = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        SOUNDS.background,
        { isLooping: true, volume: isMuted ? 0 : 1 }
      );
      setBackgroundSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing background music:', error);
    }
  };

  const toggleMute = async () => {
    setIsMuted(prev => !prev);
    if (backgroundSound) {
      await backgroundSound.setVolumeAsync(isMuted ? 1 : 0);
    }
  };

  // Completely rewrite the setupGame function to ensure letters are properly generated
const setupGame = () => {
  if (availableWords && availableWords.length > 0) {
    // First, reset any existing letter state
    setLetters([]);
    setBlanks([]);
    setDroppedLetters([]);
    setRevealedHint('');
    setBlankPositions({}); // Reset blank positions
    
    // Randomly select a word from availableWords
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const wordData = availableWords[randomIndex];

    // Remove this word from availableWords to prevent repetition
    const updatedAvailableWords = [...availableWords];
    updatedAvailableWords.splice(randomIndex, 1);
    setAvailableWords(updatedAvailableWords);

    // Set current word data
    setCurrentWord(wordData.word);
    setCurrentImage(wordData.image);
    setCurrentHint(wordData.hint);

    // Update progress based on words used
    const totalWords = GAME_DATA[difficulty].length;
    const wordsCompleted = GAME_DATA[difficulty].length - updatedAvailableWords.length;
    setProgress((wordsCompleted / totalWords) * 100);

    // Generate a fresh set of 15 letters that includes all word letters
    const wordLetters = wordData.word.split('');
    
    // Create blank spaces for the word
    const blankSpaces = wordLetters.map((letter, index) => ({
      id: `blank-${index}`,
      letter: letter,
      filled: false,
      filledWithLetterId: null,
    }));
    
    setBlanks(blankSpaces);
    
    // IMPORTANT: We generate letters in a separate step to avoid state timing issues
    setTimeout(() => {
      // Generate fresh letter set with all required letters for the word
      const freshLetters = generateLetterSet(wordLetters);
      
      // Set these letters with default positions (they'll be positioned later)
      setLetters(freshLetters.map(letter => ({
        ...letter,
        hasBeenPositioned: false,
        position: new Animated.ValueXY({ x: -100, y: -100 }),
        originalPosition: { x: -100, y: -100 }
      })));
      
      // Position the letters after they're set in state
      setTimeout(() => {
        if (letterPlaygroundLayout.width) {
          positionLetters();
        } else {
          setTimeout(positionLetters, 300);
        }
      }, 100);
    }, 50);

    // Speak the word
    if (!isMuted) {
      Speech.speak(wordData.word, {
        language: 'en',
        pitch: 1.0,
        rate: 0.75,
      });
    }
  } else {
    endGame();
  }
};

// Update setupGameWithWords with similar changes
const setupGameWithWords = (words) => {
  // Make sure we have words available
  if (!words || words.length === 0) {
    console.error("No words available for this difficulty!");
    return;
  }

  // First, reset any existing letter state
  setLetters([]);
  setBlanks([]);
  setDroppedLetters([]);
  setRevealedHint('');
  setBlankPositions({}); // Reset blank positions
  
  // Set available words state for future reference
  setAvailableWords(words);

  // Randomly select a word from words parameter (not from state)
  const randomIndex = Math.floor(Math.random() * words.length);
  const wordData = words[randomIndex];

  // Remove this word from words to prevent repetition
  const updatedWords = [...words];
  updatedWords.splice(randomIndex, 1);

  // Update availableWords state with the remaining words
  setAvailableWords(updatedWords);

  // Set current word data
  setCurrentWord(wordData.word);
  setCurrentImage(wordData.image);
  setCurrentHint(wordData.hint);

  // Create blank spaces for the word
  const wordLetters = wordData.word.split('');
  const blankSpaces = wordLetters.map((letter, index) => ({
    id: `blank-${index}`,
    letter: letter,
    filled: false,
    filledWithLetterId: null,
  }));
  
  setBlanks(blankSpaces);
  
  // Update progress based on words used
  const totalWords = GAME_DATA[difficulty].length;
  const wordsCompleted = GAME_DATA[difficulty].length - updatedWords.length;
  setProgress((wordsCompleted / totalWords) * 100);
  
  // Generate letters in a separate step with timeout to ensure state consistency
  setTimeout(() => {
    // Generate fresh letter set with all required letters
    const freshLetters = generateLetterSet(wordLetters);
    
    // Set letters with default positions
    setLetters(freshLetters.map(letter => ({
      ...letter,
      hasBeenPositioned: false,
      position: new Animated.ValueXY({ x: -100, y: -100 }),
      originalPosition: { x: -100, y: -100 }
    })));
    
    // Position letters after they're set in state
    setTimeout(positionLetters, 100);
  }, 50);

  // Speak the word
  if (!isMuted) {
    Speech.speak(wordData.word, {
      language: 'en',
      pitch: 1.0,
      rate: 0.75,
    });
  }
};

// Remove the duplicate positionLetters function and replace with a single implementation
// Removed duplicate declaration of positionLetters

// Fix the generateLetterSet function to add proper error handling and unique IDs
const generateLetterSet = (wordLetters) => {
  try {
    console.log("Generating letter set for word:", wordLetters.join(''));
    
    // Force uppercase for consistency
    const uppercaseWordLetters = wordLetters.map(letter => letter.toUpperCase());
    
    // Create required letter objects - one for each letter in the word
    const wordLetterObjects = [];
    
    // Generate a unique timestamp for this generation to avoid ID collisions
    const timestamp = Date.now();
    
    uppercaseWordLetters.forEach((letter, index) => {
      wordLetterObjects.push({
        id: `word-${index}-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
        letter: letter,
        position: new Animated.ValueXY({ x: 0, y: 0 }),
        originalPosition: { x: 0, y: 0 },
        inDropZone: false,
        used: false,
        isDragging: false,
      });
    });
    
    // Add extra random letters to reach exactly 15 letters total
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const extraLetterCount = 15 - wordLetterObjects.length;
    
    // Track letter frequencies to avoid too many duplicates
    const letterCounts = {};
    uppercaseWordLetters.forEach(letter => {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });
    
    // Common letters that appear frequently in words
    const commonLetters = 'ETAOINRSHDLUC';
    
    // Generate "near" letters to the word letters
    const nearLetters = uppercaseWordLetters.flatMap(letter => {
      const charCode = letter.charCodeAt(0);
      const nearChars = [];
      
      // Get letters before and after in the alphabet
      for (let offset = -2; offset <= 2; offset++) {
        if (offset === 0) continue;
        const newChar = String.fromCharCode(charCode + offset);
        if (newChar >= 'A' && newChar <= 'Z') {
          nearChars.push(newChar);
        }
      }
      return nearChars;
    });
    
    // Create extra letters
    const extraLetters = [];
    
    for (let i = 0; i < extraLetterCount; i++) {
      let randomLetter;
      
      // 30% chance to duplicate a letter from the word
      if (Math.random() < 0.3 && uppercaseWordLetters.length > 0) {
        randomLetter = uppercaseWordLetters[Math.floor(Math.random() * uppercaseWordLetters.length)];
      } 
      // 40% chance to use a letter that's "near" the word letters
      else if (Math.random() < 0.7 && nearLetters.length > 0) {
        randomLetter = nearLetters[Math.floor(Math.random() * nearLetters.length)];
      }
      // 20% chance to use a common letter
      else if (Math.random() < 0.9) {
        randomLetter = commonLetters[Math.floor(Math.random() * commonLetters.length)];
      }
      // 10% chance to use a completely random letter
      else {
        randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      
      // Limit duplicates to maximum 3 of each letter
      const letterCount = letterCounts[randomLetter] || 0;
      if (letterCount >= 3) {
        const availableLetters = alphabet.split('').filter(l => !letterCounts[l] || letterCounts[l] < 2);
        if (availableLetters.length > 0) {
          randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
        }
      }
      
      // Update letter count
      letterCounts[randomLetter] = (letterCounts[randomLetter] || 0) + 1;
      
      // Create the extra letter object with unique ID
      extraLetters.push({
        id: `extra-${i}-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
        letter: randomLetter,
        position: new Animated.ValueXY({ x: 0, y: 0 }),
        originalPosition: { x: 0, y: 0 },
        inDropZone: false,
        used: false,
        isDragging: false,
      });
    }
    
    // Combine and shuffle all letters
    const allLetters = [...wordLetterObjects, ...extraLetters];
    const shuffledLetters = allLetters.sort(() => Math.random() - 0.5);
    
    console.log("Generated letter set:", shuffledLetters.map(l => l.letter).join(''));
    
    return shuffledLetters;
  } catch (err) {
    console.log("Error generating letter set:", err);
    // Return a fallback set of letters in case of error
    return fallbackLetterSet(wordLetters);
  }
};

// Add a fallback letter generation function in case the main one fails
const fallbackLetterSet = (wordLetters) => {
  try {
    const timestamp = Date.now();
    const letters = [];
    
    // Add word letters
    wordLetters.forEach((letter, index) => {
      letters.push({
        id: `fallback-word-${index}-${timestamp}`,
        letter: letter.toUpperCase(),
        position: new Animated.ValueXY({ x: 0, y: 0 }),
        originalPosition: { x: 0, y: 0 },
        inDropZone: false,
        used: false,
        isDragging: false,
      });
    });
    
    // Add some basic extra letters to reach 15
    const extraNeeded = 15 - wordLetters.length;
    const basicLetters = 'AEIOUBCDFGHLMNPRST';
    
    for (let i = 0; i < extraNeeded; i++) {
      const randomIndex = Math.floor(Math.random() * basicLetters.length);
      letters.push({
        id: `fallback-extra-${i}-${timestamp}`,
        letter: basicLetters[randomIndex],
        position: new Animated.ValueXY({ x: 0, y: 0 }),
        originalPosition: { x: 0, y: 0 },
        inDropZone: false,
        used: false,
        isDragging: false,
      });
    }
    
    return letters.sort(() => Math.random() - 0.5);
  } catch (err) {
    console.log("Fallback letter generation failed:", err);
    return [];
  }
};

  // New function to position letters once playground is measured
  // Replace the existing positionLetters function with this implementation
  const positionLetters = () => {
    if (!letterPlaygroundLayout.width || letters.length === 0) return;

    // Define letter size
    const letterWidth = 40;
    const letterHeight = 40;

    // Add strict padding to keep letters away from the edges
    const padding = 25;
    
    // Get container dimensions
    const containerWidth = letterPlaygroundLayout.width;
    const containerHeight = letterPlaygroundLayout.height || 210;

    // Calculate usable area
    const usableWidth = containerWidth - (padding * 2);
    const usableHeight = containerHeight - (padding * 2);
    
    // For 15 letters, use 5 columns for optimal layout
    const maxColumns = 5;
    const rows = Math.ceil(letters.length / maxColumns);
    
    // Calculate spacing between letters (no random jitter)
    const horizontalSpacing = usableWidth / maxColumns;
    const verticalSpacing = usableHeight / rows;
    
    // Create updated letters array with stable positions
    const updatedLetters = [];
    
    // Check if positions have already been set (to prevent constant repositioning)
    const needsPositioning = !letters[0].hasBeenPositioned;
    
    letters.forEach((letter, index) => {
      // Only update positions if it's the initial positioning
      if (needsPositioning) {
        const col = index % maxColumns;
        const row = Math.floor(index / maxColumns);
        
        // Calculate base position with precise centering (no random values)
        const x = padding + (col * horizontalSpacing) + (horizontalSpacing/2 - letterWidth/2);
        const y = padding + (row * verticalSpacing) + (verticalSpacing/2 - letterHeight/2);
        
        // Set position with no jitter for stability
        const newPosition = { x, y };
        letter.position.setValue(newPosition);
        
        updatedLetters.push({
          ...letter,
          originalPosition: newPosition,
          hasBeenPositioned: true // Mark as positioned to prevent future repositioning
        });
      } else {
        // If already positioned, just include letter as is (unless it's being dragged)
        if (!letter.isDragging) {
          updatedLetters.push(letter);
        } else {
          // For dragged letters, keep their current position
          updatedLetters.push({
            ...letter,
            hasBeenPositioned: true
          });
        }
      }
    });
    
    // Only update state if we needed positioning
    if (needsPositioning) {
      setLetters(updatedLetters);
    }
  };

  // Call positionLetters whenever the letterPlaygroundLayout or letters change
  useEffect(() => {
    if (letterPlaygroundLayout.width && letters.length > 0) {
      // Only position letters once when layout is ready or letters are changed
      positionLetters();
    }
  }, [letterPlaygroundLayout.width, letters.length]); // Only re-run if width or letter count changes

  // Create pan responders for each letter
  const createPanResponder = (letter) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Check if the letter is used in a blank and remove it
        if (letter.used) {
          // Find which blank has this letter
          const blankWithLetter = blanks.find(b => b.filledWithLetterId === letter.id);
          if (blankWithLetter) {
            const updatedBlanks = blanks.map(b =>
              b.id === blankWithLetter.id
                ? { ...b, filled: false, filledWithLetterId: null }
                : b
            );
            setBlanks(updatedBlanks);

            // Remove this letter from droppedLetters
            setDroppedLetters(prev => prev.filter(l => l.blankId !== blankWithLetter.id));
          }

          // Update letter state
          const updatedLetters = letters.map(l =>
            l.id === letter.id
              ? { ...l, used: false, inDropZone: false }
              : l
          );
          setLetters(updatedLetters);
        }

        // Make the letter appear above all other elements when dragging
        letter.position.setOffset({
          x: letter.position.x._value,
          y: letter.position.y._value
        });
        letter.position.setValue({ x: 0, y: 0 });

        // Mark this letter as being dragged to apply special styling
        const updatedLetters = letters.map(l =>
          l.id === letter.id ? { ...l, isDragging: true } : l
        );
        setLetters(updatedLetters);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: letter.position.x, dy: letter.position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        letter.position.flattenOffset();

        // Remove the dragging state but preserve positioning status
        const updatedLetters = letters.map(l =>
          l.id === letter.id ? { ...l, isDragging: false } : l
        );
        setLetters(updatedLetters);

        // Check if letter is dropped on a blank
        const droppedOnBlank = checkDropZone(letter, gesture);

        if (!droppedOnBlank) {
          // Return to original position with animation, but keep hasBeenPositioned true
          Animated.spring(letter.position, {
            toValue: letter.originalPosition,
            friction: 5,
            useNativeDriver: false
          }).start();

          if (!isMuted) {
            playSound(SOUNDS.wrong);
          }
        }
      }
    });
  };

  // Update the checkDropZone function to add error handling
// Removed duplicate declaration of checkDropZone to avoid redeclaration error

// Update the checkDropZone function with a more robust approach
// Removed duplicate declaration of checkDropZone to avoid redeclaration error

// Completely revise the checkDropZone function to allow filling blanks in any order
const checkDropZone = (letter, gesture) => {
  try {
    // Find all empty blanks
    const emptyBlanks = blanks.filter(blank => !blank.filled);
    
    if (emptyBlanks.length === 0) {
      console.log("No empty blanks available");
      return false;
    }
    
    // Get drop position
    const dropX = gesture.moveX;
    const dropY = gesture.moveY;
    
    // Define the valid drop area (vertical range)
    const screenHeight = Dimensions.get('window').height;
    const dropAreaTop = 250;
    const dropAreaBottom = screenHeight * 0.65;
    
    // Check if the drop is within vertical bounds of the blanks area
    if (dropY >= dropAreaTop && dropY <= dropAreaBottom) {
      console.log("Drop detected in valid vertical range");
      
      // Get reference to the blank container for coordinate estimation
      const screenWidth = Dimensions.get('window').width;
      const blankWidth = 35; // From our styles
      const margin = 5; // From our styles
      const totalBlanksWidth = blanks.length * (blankWidth + margin * 2);
      const startX = (screenWidth - totalBlanksWidth) / 2;
      
      // Find the closest blank based on horizontal position
      let targetBlankIndex = -1;
      let closestDistance = Infinity;
      
      // Compare drop position to estimated position of each blank
      emptyBlanks.forEach((blank) => {
        // Get the index of this blank in the original blanks array
        const blankIndex = blanks.findIndex(b => b.id === blank.id);
        
        // Calculate estimated center position of this blank
        const blankCenterX = startX + (blankIndex * (blankWidth + margin * 2)) + (blankWidth / 2) + margin;
        
        // Calculate horizontal distance
        const distance = Math.abs(dropX - blankCenterX);
        
        // If this is closer than current closest, update
        if (distance < closestDistance) {
          closestDistance = distance;
          targetBlankIndex = blankIndex;
        }
      });
      
      // Make sure we found a valid blank
      if (targetBlankIndex >= 0) {
        const targetBlank = blanks[targetBlankIndex];
        
        // Update the blank state
        const updatedBlanks = blanks.map(b => 
          b.id === targetBlank.id ? 
          { ...b, filled: true, filledWithLetterId: letter.id } : 
          b
        );
        
        // Add to dropped letters array
        setDroppedLetters(prev => [
          ...prev,
          {
            letterId: letter.id,
            letter: letter.letter,
            blankId: targetBlank.id
          }
        ]);
        
        // Update the letter state
        const updatedLetters = letters.map(l => 
          l.id === letter.id ? 
          { ...l, used: true, inDropZone: true } : 
          l
        );
        
        // Return letter to its original position
        Animated.spring(letter.position, {
          toValue: letter.originalPosition,
          friction: 5,
          useNativeDriver: false
        }).start();
        
        setBlanks(updatedBlanks);
        setLetters(updatedLetters);
        
        // Play feedback
        if (!isMuted) {
          playSound(SOUNDS.drop);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Check if all blanks are filled
        const allFilled = updatedBlanks.every(blank => blank.filled);
        if (allFilled) {
          setTimeout(() => {
            checkAnswer();
          }, 500);
        }
        
        return true;
      }
    }
    
    console.log("Drop outside of valid range or no close blank found");
    return false;
  } catch (err) {
    console.log("Error in checkDropZone:", err);
    return false;
  }
};

  // Add new function to check if the answer is correct
  const checkAnswer = () => {
    // Get the current word and dropped letters
    const wordLetters = currentWord.split('');

    // Check if all blanks are filled
    const allFilled = blanks.length === wordLetters.length &&
      blanks.every(blank => blank.filled);

    if (!allFilled) {
      // Exit if not all blanks are filled
      return;
    }

    // Create array of letters in order of blanks
    const spelledWord = blanks.map(blank => {
      const filledLetter = letters.find(l => l.id === blank.filledWithLetterId);
      return filledLetter ? filledLetter.letter : '';
    }).join('');

    // Normalize both words for comparison - trim and lowercase
    const normalizedSpelledWord = spelledWord.trim().toLowerCase();
    const normalizedTargetWord = currentWord.trim().toLowerCase();

    // Debug alert to show what's being compared
    console.log(`Comparing: "${normalizedSpelledWord}" with "${normalizedTargetWord}"`);

    // Compare the full words
    if (normalizedSpelledWord === normalizedTargetWord) {
      handleWordComplete();
    } else {
      if (!isMuted) {
        playSound(SOUNDS.wrong);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Reset blanks and return letters to original positions
      resetWord();
    }
  };

  // Function to reset the current word attempt
  const resetWord = () => {
    // Clear all blanks
    const resetBlanks = blanks.map(blank => ({
      ...blank,
      filled: false,
      filledWithLetterId: null
    }));

    // Reset all letters
    const resetLetters = letters.map(letter => {
      if (letter.used) {
        // Return to original position
        Animated.spring(letter.position, {
          toValue: letter.originalPosition,
          friction: 5,
          useNativeDriver: false
        }).start();

        return {
          ...letter,
          used: false,
          inDropZone: false
        };
      }
      return letter;
    });

    setBlanks(resetBlanks);
    setLetters(resetLetters);
    setDroppedLetters([]);
  };

  // Update handleSubmitWord to use the checkAnswer function
  const handleSubmitWord = () => {
    const allBlanks = blanks.length === currentWord.length;
    const allFilled = blanks.every(blank => blank.filled);

    if (!allBlanks) {
      Alert.alert("Error", "There seems to be a problem with the blanks. Please reset and try again.");
      return;
    }

    if (!allFilled) {
      Alert.alert("Incomplete", "Please fill all the blanks first.");
      return;
    }

    checkAnswer();
  };

  // Ensure we complete a word and move to the next one properly
const handleWordComplete = () => {
  try {
    playSound(SOUNDS.correct);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show success animation
    if (correctAnimation.current) {
      correctAnimation.current.play();
    }

    // Update score
    const wordScore = currentWord.length * 10;
    setScore(prevScore => prevScore + wordScore);

    // Wait a moment before moving to next word
    setTimeout(() => {
      // Clear current state completely
      setLetters([]);
      setBlanks([]);
      setDroppedLetters([]);
      setRevealedHint('');
      setBlankPositions({}); // Clear blank positions
      
      // Setup next word after a delay to ensure clean state
      setTimeout(() => {
        if (availableWords && availableWords.length > 0) {
          setupGame();
        } else {
          endGame();
        }
      }, 300);
    }, 1500);
  } catch (err) {
    console.log("Error in handleWordComplete:", err);
    
    // Fallback to simply setting up the next word on error
    setTimeout(() => {
      if (availableWords && availableWords.length > 0) {
        setupGame();
      } else {
        endGame();
      }
    }, 1000);
  }
};

  const endGame = () => {
    setGameOver(true);
    playSound(SOUNDS.complete);

    if (backgroundSound) {
      backgroundSound.stopAsync();
    }

    // Show completion animation
    if (animation.current) {
      animation.current.play();
    }

    // Navigate to summary screen
    setTimeout(() => {
      setGameState('summary');
    }, 2000);
  };

  const playSound = async (soundFile) => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();

      // Unload sound when finished
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleQuit = () => {
    Alert.alert(
      "Quit Game",
      "Are you sure you want to quit? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Quit",
          style: "destructive",
          onPress: () => {
            if (backgroundSound) {
              backgroundSound.stopAsync();
            }
            setGameState('difficulty');
          }
        }
      ]
    );
  };

  const handleSkipWord = () => {
    Alert.alert(
      "Skip Word",
      "Are you sure you want to skip this word? You won't earn points for it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          onPress: () => {
            // Skip current word and move to next one
            if (availableWords.length > 0) {
              setupGame();
            } else {
              endGame();
            }
          }
        }
      ]
    );
  };

  const handleHint = () => {
    // Create a partial word hint
    const wordLength = currentWord.length;
    let hint = '';

    // For 3-4 letter words, show 1 letter, for longer words show more
    const hintLetterCount = wordLength <= 4 ? 1 : wordLength <= 6 ? 2 : 3;

    for (let i = 0; i < wordLength; i++) {
      // Show first n letters as hint
      if (i < hintLetterCount) {
        hint += currentWord[i];
      } else {
        hint += '_';
      }
    }

    setRevealedHint(hint);

    // Also speak the hint
    if (!isMuted) {
      Speech.speak(`The word starts with ${currentWord.slice(0, hintLetterCount)}`, {
        language: 'en',
        pitch: 1.0,
        rate: 0.75,
      });
    }
  };

  const handleSelectDifficulty = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setCurrentWordIndex(0);
    setScore(0);
    setProgress(0);
    setGameOver(false);
    setGameState('game');
  };

  const handlePlayAgain = () => {
    // Reset game state but keep the same difficulty
    setCurrentWordIndex(0);
    setScore(0);
    setProgress(0);
    setGameOver(false);
    setGameState('game');
  };

  // Render different screens based on gameState
  const renderScreen = () => {
    switch (gameState) {
      case 'splash':
        return renderSplashScreen();
      case 'difficulty':
        return renderDifficultyScreen();
      case 'game':
        return renderGameScreen();
      case 'summary':
        return renderSummaryScreen();
      default:
        return renderSplashScreen();
    }
  };

  // Splash Screen
  const renderSplashScreen = () => {
    return (
      <ImageBackground
        source={require('./assets/images/space_background.png')}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <LottieView
            ref={splashAnimation}
            source={require('./assets/animations/correct.json')}
            style={styles.animation}
          />

          <Animated.View style={styles.titleContainer}>
            <Text style={styles.title}>Ocean Spelling</Text>
            <Text style={styles.subtitle}>Adventure</Text>
          </Animated.View>
        </View>
      </ImageBackground>
    );
  };

  // Difficulty Selection Screen
  const renderDifficultyScreen = () => {
    return (
      <ImageBackground
        source={require('./assets/images/space_background.png')}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Select Difficulty</Text>

          <View style={styles.difficultyContainer}>
            <TouchableOpacity
              style={[styles.difficultyButton, styles.easyButton]}
              onPress={() => handleSelectDifficulty('easy')}
            >
              <Image
                source={require('./assets/images/fish.png')}
                style={styles.difficultyIcon}
              />
              <Text style={styles.difficultyText}>Easy</Text>
              <Text style={styles.difficultyDescription}>Simple words</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.difficultyButton, styles.mediumButton]}
              onPress={() => handleSelectDifficulty('medium')}
            >
              <Image
                source={require('./assets/images/fish.png')}
                style={styles.difficultyIcon}
              />
              <Text style={styles.difficultyText}>Medium</Text>
              <Text style={styles.difficultyDescription}>Moderate words</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.difficultyButton, styles.hardButton]}
              onPress={() => handleSelectDifficulty('hard')}
            >
              <Image
                source={require('./assets/images/fish.png')}
                style={styles.difficultyIcon}
              />
              <Text style={styles.difficultyText}>Hard</Text>
              <Text style={styles.difficultyDescription}>Challenging words</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToHome}
          >
            <Text style={styles.backButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  };

  // Game Screen
  const renderGameScreen = () => {
    try {
      return (
        <ImageBackground
          source={require('./assets/images/space_background.png')}
          style={styles.container}
        >
          {/* Header - same for all difficulties */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={handleQuit}>
              <MaterialIcons name="exit-to-app" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{score}</Text>
            </View>

            <TouchableOpacity style={styles.iconButton} onPress={toggleMute}>
              <FontAwesome name={isMuted ? "volume-off" : "volume-up"} size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar - same for all difficulties */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          {/* Word Image - same container size for all difficulties */}
          <View style={styles.imageContainer}>
            <Image source={currentImage} style={styles.wordImage} resizeMode="contain" />
          </View>

          {/* Revealed Hint - same for all difficulties */}
          {revealedHint ? (
            <View style={styles.revealedHintContainer}>
              <Text style={styles.revealedHintText}>{revealedHint}</Text>
            </View>
          ) : null}

          {/* Letter Container - same size and layout for all difficulties */}
          <View style={styles.letterContainerOuter}>
            <View style={styles.letterContainerInner}>
              {blanks.map((blank, index) => {
                // Find the letter that fills this blank
                const fillingLetter = blank.filled ?
                  letters.find(l => l.id === blank.filledWithLetterId) : null;

                return (
                  <View
                    key={blank.id}
                    style={[
                      styles.blankContainer,
                      blank.filled ? styles.filledBlank : {}
                    ]}
                    onLayout={(event) => {
                      try {
                        const { width, height } = event.nativeEvent.layout;
                        // Only store dimensions - we don't need position for the simplified approach
                        setBlankPositions(prev => ({
                          ...prev,
                          [blank.id]: { width, height }
                        }));
                      } catch (e) {
                        console.log("Error in blank onLayout:", e);
                      }
                    }}
                  >
                    {blank.filled ? (
                      <Text style={styles.blankFilledText}>
                        {fillingLetter ? fillingLetter.letter.toUpperCase() : ''}
                      </Text>
                    ) : (
                      <Text style={styles.blankText}>_</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Letter Playground - consistent size and layout for all difficulties */}
          <View
            style={styles.letterPlayground}
            onLayout={(event) => {
              const { x, y, width, height } = event.nativeEvent.layout;
              setLetterPlaygroundLayout({ x, y, width, height });
              // Position letters once layout is ready, with slight delay
              if (letters.length > 0) {
                setTimeout(positionLetters, 50);
              }
            }}
          >
            {/* Draggable Letters - same size and behavior for all difficulties */}
            {letters.map((letter) => {
              const panResponder = createPanResponder(letter);

              return (
                <Animated.View
                  key={letter.id}
                  style={[
                    styles.letter,
                    { transform: letter.position.getTranslateTransform() },
                    letter.used && styles.usedLetter,
                    letter.isDragging && styles.draggingLetter // Apply special style when dragging
                  ]}
                  {...panResponder.panHandlers}
                >
                  <Text style={styles.letterText}>{letter.letter.toLowerCase()}</Text>
                </Animated.View>
              );
            })}
          </View>

          {/* Game Controls - same for all difficulties */}
          <View style={styles.gameControlsContainer}>
            <TouchableOpacity
              style={[styles.controlButton, styles.hintButton]}
              onPress={handleHint}
            >
              <Text style={styles.controlButtonText}>Hint</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.resetButton]}
              onPress={resetWord}
            >
              <Text style={styles.controlButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.skipButton]}
              onPress={handleSkipWord}
            >
              <Text style={styles.controlButtonText}>Skip</Text>
            </TouchableOpacity>

            {showSubmitButton && (
              <TouchableOpacity
                style={[styles.controlButton, styles.submitButton]}
                onPress={handleSubmitWord}
              >
                <Text style={styles.controlButtonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      );
    } catch (err) {
      console.log("Error rendering game screen:", err);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => setGameState('difficulty')}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  // Summary Screen
  const renderSummaryScreen = () => {
    return (
      <ImageBackground
        source={require('./assets/images/space_background.png')}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Game Complete!</Text>

          {/*<LottieView
            source={require('./assets/animations/owl.json')}
            style={styles.animation}
            autoPlay
            loop={false}
          />*/}

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Your Score:</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Difficulty:</Text>
              <Text style={styles.statValue}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>High Score:</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
          </View>

          <View style={styles.leaderboardContainer}>
            <Text style={styles.leaderboardTitle}>Leaderboard</Text>
            <View style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>1.</Text>
              <Text style={styles.leaderboardName}>You</Text>
              <Text style={styles.leaderboardScore}>{score}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.playAgainButton]}
              onPress={handlePlayAgain}
            >
              <Text style={styles.buttonText}>Play Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.menuButton]}
              onPress={() => setGameState('difficulty')}
            >
              <Text style={styles.buttonText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginTop: 30,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 150, 199, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  scoreContainer: {
    backgroundColor: 'rgba(0, 150, 199, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
  },
  scoreText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic-Bold',
  },
  progressContainer: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    marginHorizontal: 20,
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00BCD4',
    borderRadius: 5,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    marginTop: 20,
  },
  wordImage: {
    width: 150,
    height: 150,
  },
  blanksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    flexWrap: 'wrap',
  },
  blankSpace: {
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blankLine: {
    color: 'white',
    fontSize: 30,
    fontFamily: 'OpenDyslexic',
  },
  letter: {
    position: 'absolute',
    width: 40, // Reduced from 45
    height: 40, // Reduced from 45
    borderRadius: 20,
    backgroundColor: '#FFFDE7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    zIndex: 10, // Increased z-index
    borderWidth: 2,
    borderColor: '#DDD5BE',
    // Add tap highlight effect
    touchAction: 'none',
  },
  draggingLetter: {
    zIndex: 1000, // Much higher z-index while dragging
    elevation: 25, // Higher elevation for Android
    shadowOpacity: 0.7, // More pronounced shadow
    shadowRadius: 7,
    backgroundColor: '#FFFFE0', // Slightly brighter to indicate dragging state
    borderColor: '#FFD700', // Gold border when dragging
  },
  usedLetter: {
    opacity: 0.8,
    backgroundColor: '#D4F5D4',
    borderColor: '#76C376',
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  completeAnimation: {
    width: 300,
    height: 300,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic',
  },
  // Difficulty screen styles
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontFamily: 'OpenDyslexic-Bold',
  },
  subtitle: {
    fontSize: 24,
    color: '#00BCD4',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontFamily: 'OpenDyslexic',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  difficultyContainer: {
    width: '100%',
    alignItems: 'center',
  },
  difficultyButton: {
    width: '80%',
    height: 100,
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  easyButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  mediumButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
  },
  hardButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  difficultyIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  difficultyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'OpenDyslexic-Bold',
  },
  difficultyDescription: {
    fontSize: 14,
    color: 'white',
    marginLeft: 'auto',
    fontFamily: 'OpenDyslexic',
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic',
  },
  // Summary screen styles
  scoreLabel: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'OpenDyslexic',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontFamily: 'OpenDyslexic-Bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'OpenDyslexic',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'OpenDyslexic-Bold',
  },
  leaderboardContainer: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'OpenDyslexic-Bold',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  leaderboardRank: {
    width: '15%',
    fontSize: 16,
    color: 'white',
    fontFamily: 'OpenDyslexic',
  },
  leaderboardName: {
    width: '50%',
    fontSize: 16,
    color: 'white',
    fontFamily: 'OpenDyslexic',
  },
  leaderboardScore: {
    width: '35%',
    fontSize: 16,
    color: 'white',
    textAlign: 'right',
    fontFamily: 'OpenDyslexic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 130,
    alignItems: 'center',
  },
  playAgainButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    marginRight: 10,
  },
  menuButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic',
  },
  gameControlsContainer: {
    position: 'absolute',
    bottom: 10, // Move up slightly
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    zIndex: 20,
  },
  controlButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(0, 150, 199, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic',
  },
  hintButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
  },
  submitButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
  },
  resetButton: {
    backgroundColor: 'rgba(233, 30, 99, 0.8)',
  },
  revealedHintContainer: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  revealedHintText: {
    color: 'white',
    fontSize: 24,
    letterSpacing: 8,
    fontFamily: 'OpenDyslexic-Bold',
  },
  letterContainerOuter: {
    width: '94%',
    marginHorizontal: '3%',
    backgroundColor: 'rgba(0, 79, 113, 0.6)',
    borderRadius: 15,
    padding: 15,
    paddingVertical: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    minHeight: 100, // Reduced height to make more room for letters
    zIndex: 5, // Lower than letter z-index
  },
  letterContainerInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  blankContainer: {
    width: 35,
    height: 35,
    margin: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 150, 199, 0.3)',
  },
  blankText: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'OpenDyslexic',
  },
  blankFilledText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic-Bold',
  },
  filledBlank: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: 'rgba(76, 175, 80, 0.7)',
  },
  filledBlankOverlay: {
    width: '80%',
    height: '80%',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  letterPlayground: {
    width: '94%',
    marginHorizontal: '3%',
    backgroundColor: 'rgba(0, 79, 113, 0.4)',
    borderRadius: 20,
    padding: 15,
    marginTop: 15,
    minHeight: 210, // Increased height to provide more vertical space
    marginBottom: 80,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    aspectRatio: 1.8,
    alignSelf: 'center',
    overflow: 'visible', // Changed from 'hidden' to allow letters to be visible outside container
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'OpenDyslexic',
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderRadius: 25,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'OpenDyslexic',
  }
});

export default DSpellingGame;