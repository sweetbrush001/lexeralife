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
      // Initialize available words when game starts
      setAvailableWords([...GAME_DATA[difficulty]]);
      setupGame();
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

  const setupGame = () => {
    if (availableWords.length > 0) {
      // Randomly select a word from available words
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const wordData = availableWords[randomIndex];

      // Remove this word from available words to prevent repetition
      const updatedAvailableWords = [...availableWords];
      updatedAvailableWords.splice(randomIndex, 1);
      setAvailableWords(updatedAvailableWords);

      // Set current word data
      setCurrentWord(wordData.word);
      setCurrentImage(wordData.image);
      setCurrentHint(wordData.hint);
      setRevealedHint('');

      // Create letter objects with non-overlapping positions
      const wordLetters = wordData.word.split('');
      const allLetters = generateLetterSet(wordLetters);

      // Create blank spaces for the word
      const blankSpaces = wordLetters.map((letter, index) => ({
        id: `blank-${index}`,
        letter: letter,
        filled: false,
        filledWithLetterId: null,
      }));

      setBlanks(blankSpaces);
      setLetters(allLetters);

      // Update progress based on words used
      const totalWords = GAME_DATA[difficulty].length;
      const wordsCompleted = GAME_DATA[difficulty].length - updatedAvailableWords.length;
      setProgress((wordsCompleted / totalWords) * 100);

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

  const generateLetterSet = (wordLetters) => {
    // Create letter objects for the word
    const gridSize = 40; // Size of each letter bubble (smaller)
    const padding = 8; // Padding between letters (smaller)

    // We'll use the letterPlaygroundLayout to position letters
    const wordLetterObjects = wordLetters.map((letter, index) => {
      return {
        id: `word-${index}`,
        letter: letter,
        position: new Animated.ValueXY({ x: 0, y: 0 }), // Initial position will be set after layout
        originalPosition: { x: 0, y: 0 }, // Will be set after layout
        inDropZone: false,
        used: false,
      };
    });

    // Add some extra random letters - ensure the same total letter count for each difficulty
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const extraLetters = [];

    // Always make total letters equal 10 (word letters + extra letters = 10)
    const totalLetters = 10;
    const extraLetterCount = Math.max(0, totalLetters - wordLetters.length);

    for (let i = 0; i < extraLetterCount; i++) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];

      extraLetters.push({
        id: `extra-${i}`,
        letter: randomLetter,
        position: new Animated.ValueXY({ x: 0, y: 0 }), // Initial position will be set after layout
        originalPosition: { x: 0, y: 0 }, // Will be set after layout
        inDropZone: false,
        used: false,
      });
    }

    // Combine and shuffle all letters
    return [...wordLetterObjects, ...extraLetters].sort(() => Math.random() - 0.5);
  };

  // New function to position letters once playground is measured
  const positionLetters = () => {
    if (!letterPlaygroundLayout.width) return;

    const letterWidth = 40; // Width of each letter bubble - reduced from 45
    const letterHeight = 40; // Height of each letter bubble - reduced from 45
    const horizontalPadding = 8; // Padding between letters horizontally - reduced from 10
    const verticalPadding = 8; // Padding between letters vertically - reduced from 10

    // Calculate how many letters we can fit per row
    const lettersPerRow = Math.floor((letterPlaygroundLayout.width) / (letterWidth + horizontalPadding));

    // Create a new array with updated positions
    const updatedLetters = [...letters].map((letter, index) => {
      // Calculate grid position
      const row = Math.floor(index / lettersPerRow);
      const col = index % lettersPerRow;

      // Calculate actual x and y coordinates
      const x = (col * (letterWidth + horizontalPadding)) + horizontalPadding +
        (letterPlaygroundLayout.width - (lettersPerRow * (letterWidth + horizontalPadding))) / 2;
      const y = (row * (letterHeight + verticalPadding)) + verticalPadding;

      // Add some randomness to make it look scattered
      const randomOffsetX = Math.random() * 10 - 5; // Reduced randomness
      const randomOffsetY = Math.random() * 10 - 5; // Reduced randomness

      const newPosition = {
        x: x + randomOffsetX,
        y: y + randomOffsetY
      };

      // Update the Animated.ValueXY with the new position
      letter.position.setValue(newPosition);

      return {
        ...letter,
        originalPosition: newPosition
      };
    });

    setLetters(updatedLetters);
  };

  // Call positionLetters whenever the letterPlaygroundLayout or letters change
  useEffect(() => {
    if (letterPlaygroundLayout.width && letters.length > 0) {
      positionLetters();
    }
  }, [letterPlaygroundLayout, currentWordIndex]);

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

        letter.position.setOffset({
          x: letter.position.x._value,
          y: letter.position.y._value
        });
        letter.position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: letter.position.x, dy: letter.position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        letter.position.flattenOffset();

        // Check if letter is dropped on a blank
        const droppedOnBlank = checkDropZone(letter, gesture);

        if (!droppedOnBlank) {
          // Return to original position with animation
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

  const checkDropZone = (letter, gesture) => {
    // Use simplified approach with fixed area for dropping
    const dropAreaTop = 280;    // Reduced slightly to account for larger container
    const dropAreaBottom = 500; // Increased to account for larger container
    const letterX = gesture.moveX;
    const letterY = gesture.moveY;

    // Check if letter is within the general drop area
    if (letterY >= dropAreaTop && letterY <= dropAreaBottom) {
      // Find the first empty blank
      const emptyBlank = blanks.find(blank => !blank.filled);

      if (emptyBlank) {
        // Update the blank
        const updatedBlanks = blanks.map(b =>
          b.id === emptyBlank.id
            ? { ...b, filled: true, filledWithLetterId: letter.id }
            : b
        );

        // Store dropped letter information
        setDroppedLetters(prev => [
          ...prev,
          {
            letterId: letter.id,
            letter: letter.letter,
            blankId: emptyBlank.id
          }
        ]);

        // Update the letter
        const updatedLetters = letters.map(l =>
          l.id === letter.id
            ? { ...l, used: true, inDropZone: true }
            : l
        );

        // Instead of moving letter to blank position, return it to its original position
        Animated.spring(letter.position, {
          toValue: letter.originalPosition,
          friction: 5,
          useNativeDriver: false
        }).start();

        setBlanks(updatedBlanks);
        setLetters(updatedLetters);

        // Play sound and haptic feedback
        if (!isMuted) {
          playSound(SOUNDS.drop);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Check if all blanks are filled to enable submit
        const allFilled = updatedBlanks.every(blank => blank.filled);
        if (allFilled) {
          // Auto-submit after a brief delay
          setTimeout(() => {
            checkAnswer();
          }, 500);
        }

        return true;
      }
    }

    return false;
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

  const handleWordComplete = () => {
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
      // No need to increment currentWordIndex, just setup next word
      if (availableWords.length > 0) {
        setupGame();
      } else {
        endGame();
      }
    }, 1500);
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
                >
                  {blank.filled ? (
                    <Text style={styles.blankFilledText}>
                      {fillingLetter ? fillingLetter.letter : ''}
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
                  letter.used && styles.usedLetter
                ]}
                {...panResponder.panHandlers}
              >
                <Text style={styles.letterText}>{letter.letter}</Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Game Complete Animation - same for all difficulties */}
        {gameOver && (
          <View style={styles.gameOverContainer}>
            <LottieView
              ref={animation}
              source={require('./assets/animations/complete-game.json')}
              style={styles.completeAnimation}
              autoPlay
            />
          </View>
        )}

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
    width: 45, // Reduced from 60
    height: 45, // Reduced from 60
    borderRadius: 25, // Reduced from 25
    backgroundColor: '#FFFDE7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#DDD5BE',
  },
  usedLetter: {
    opacity: 0.8,
    backgroundColor: '#D4F5D4',
    borderColor: '#76C376',
  },
  letterText: {
    fontSize: 24, // Reduced from 30
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'OpenDyslexic-Bold',
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
    bottom: 15, // Reduced from 20 to move controls up slightly
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    zIndex: 20, // Added to ensure controls appear above other elements
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
    padding: 20,
    paddingVertical: 30,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    minHeight: 120,
  },
  letterContainerInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  blankContainer: {
    width: 60,
    height: 60,
    margin: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 150, 199, 0.3)',
  },
  blankText: {
    color: 'white',
    fontSize: 36,
    fontFamily: 'OpenDyslexic',
  },
  blankFilledText: {
    color: 'white',
    fontSize: 32,
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
    borderRadius: 15,
    padding: 10,
    marginTop: 20,
    minHeight: 140, // Reduced from 180
    marginBottom: 100, // Increased from 80 to make room for controls
    position: 'relative', // To position letter bubbles inside
  },
});

export default DSpellingGame;