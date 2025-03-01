import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { Provider as PaperProvider, Button } from 'react-native-paper';

// Word lists by difficulty
const WORD_LISTS = {
  easy: [
    { word: 'cat', options: ['cat', 'kat', 'cet', 'caat'] },
    { word: 'dog', options: ['dog', 'dogg', 'doog', 'dag'] },
    { word: 'run', options: ['run', 'runn', 'roon', 'rann'] },
    { word: 'jump', options: ['jump', 'jamp', 'jomp', 'jumb'] },
    { word: 'play', options: ['play', 'plai', 'pley', 'pllay'] },
    { word: 'red', options: ['red', 'rid', 'reed', 'rad'] },
    { word: 'blue', options: ['blue', 'bloo', 'bleu', 'blu'] },
    { word: 'green', options: ['green', 'gren', 'grean', 'griin'] },
    { word: 'sun', options: ['sun', 'son', 'sunn', 'san'] },
    { word: 'moon', options: ['moon', 'mune', 'moom', 'muun'] }
  ],
  medium: [
    { word: 'apple', options: ['apple', 'aple', 'appel', 'apel'] },
    { word: 'banana', options: ['banana', 'bananna', 'banena', 'bananaa'] },
    { word: 'orange', options: ['orange', 'orenge', 'orang', 'oranj'] },
    { word: 'school', options: ['school', 'scool', 'skool', 'schol'] },
    { word: 'friend', options: ['friend', 'freind', 'frend', 'frind'] },
    { word: 'happy', options: ['happy', 'happi', 'hapy', 'happie'] },
    { word: 'water', options: ['water', 'watter', 'woter', 'watar'] },
    { word: 'paper', options: ['paper', 'papper', 'payper', 'papir'] },
    { word: 'music', options: ['music', 'musik', 'musick', 'muzic'] },
    { word: 'garden', options: ['garden', 'gardin', 'gorden', 'gardan'] }
  ],
  hard: [
    { word: 'elephant', options: ['elephant', 'elefant', 'elephent', 'eliphant'] },
    { word: 'beautiful', options: ['beautiful', 'beutiful', 'beautifull', 'beautifal'] },
    { word: 'computer', options: ['computer', 'computor', 'computter', 'computar'] },
    { word: 'adventure', options: ['adventure', 'adventur', 'advenchure', 'adventchur'] },
    { word: 'chocolate', options: ['chocolate', 'choclate', 'chocolat', 'chocoleit'] },
    { word: 'dinosaur', options: ['dinosaur', 'dinasaur', 'dinasour', 'dinosor'] },
    { word: 'butterfly', options: ['butterfly', 'buterfly', 'butterflye', 'butterflie'] },
    { word: 'calendar', options: ['calendar', 'calender', 'calander', 'calandar'] },
    { word: 'different', options: ['different', 'diferent', 'diffrent', 'differant'] },
    { word: 'important', options: ['important', 'importent', 'importtant', 'impotant'] }
  ],
  expert: [
    { word: 'extraordinary', options: ['extraordinary', 'extrordinary', 'extraordanary', 'extraordinery'] },
    { word: 'sophisticated', options: ['sophisticated', 'sofisticated', 'sophistecated', 'sophistikated'] },
    { word: 'phenomenon', options: ['phenomenon', 'phenominon', 'phenomonon', 'phenomenen'] },
    { word: 'conscientious', options: ['conscientious', 'conscientous', 'consientious', 'consciencious'] },
    { word: 'enthusiastic', options: ['enthusiastic', 'enthusiastik', 'enthusastic', 'enthusiastec'] },
    { word: 'surveillance', options: ['surveillance', 'surveilance', 'survellance', 'survalance'] },
    { word: 'catastrophe', options: ['catastrophe', 'catastrofe', 'catastrophy', 'catastrofy'] },
    { word: 'psychology', options: ['psychology', 'psycology', 'sychology', 'psichology'] },
    { word: 'acquaintance', options: ['acquaintance', 'acquantance', 'aquaintance', 'acquaintence'] },
    { word: 'pronunciation', options: ['pronunciation', 'pronounciation', 'pronunsiation', 'prononciation'] }
  ]
};

export default function App() {
  const [currentWordObj, setCurrentWordObj] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [round, setRound] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctSound, setCorrectSound] = useState(null);
  const [incorrectSound, setIncorrectSound] = useState(null);
  const [unlockedLevels, setUnlockedLevels] = useState(['easy']);
  const [animation, setAnimation] = useState(null);
  const [animationVisible, setAnimationVisible] = useState(false);
  const [animationSource, setAnimationSource] = useState(null);

  // Load saved data and sounds on app start
  useEffect(() => {
    loadSavedData();
    loadSounds();
    
    return () => {
      // Unload sounds when component unmounts
      if (correctSound) {
        correctSound.unloadAsync();
      }
      if (incorrectSound) {
        incorrectSound.unloadAsync();
      }
    };
  }, []);

  const loadSounds = async () => {
    try {
      const { sound: correctSoundObj } = await Audio.Sound.createAsync(
        require('./assets/correct.wav')
      );
      setCorrectSound(correctSoundObj);
      
      const { sound: incorrectSoundObj } = await Audio.Sound.createAsync(
        require('./assets/incorrect.mp3')
      );
      setIncorrectSound(incorrectSoundObj);
    } catch (error) {
      console.error('Failed to load sounds', error);
    }
  };

  const loadSavedData = async () => {
    try {
      const savedHighScore = await AsyncStorage.getItem('highScore');
      const savedUnlockedLevels = await AsyncStorage.getItem('unlockedLevels');
      const savedProgress = await AsyncStorage.getItem('gameProgress');
      
      if (savedHighScore !== null) {
        setHighScore(parseInt(savedHighScore));
      }
      
      if (savedUnlockedLevels !== null) {
        setUnlockedLevels(JSON.parse(savedUnlockedLevels));
      }
      
      if (savedProgress !== null) {
        const progress = JSON.parse(savedProgress);
        setScore(progress.score || 0);
        setDifficulty(progress.difficulty || 'easy');
        setRound(progress.round || 0);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load saved data', error);
      setLoading(false);
    }
  };

  const saveGameProgress = async () => {
    try {
      const gameProgress = {
        score,
        difficulty,
        round
      };
      await AsyncStorage.setItem('gameProgress', JSON.stringify(gameProgress));
    } catch (error) {
      console.error('Failed to save game progress', error);
    }
  };

  const saveHighScore = async (newHighScore) => {
    try {
      await AsyncStorage.setItem('highScore', newHighScore.toString());
    } catch (error) {
      console.error('Failed to save high score', error);
    }
  };

  const saveUnlockedLevels = async (levels) => {
    try {
      await AsyncStorage.setItem('unlockedLevels', JSON.stringify(levels));
    } catch (error) {
      console.error('Failed to save unlocked levels', error);
    }
  };

  const unlockNextLevel = () => {
    const levels = ['easy', 'medium', 'hard', 'expert'];
    const currentIndex = levels.indexOf(difficulty);
    
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1];
      
      if (!unlockedLevels.includes(nextLevel)) {
        const newUnlockedLevels = [...unlockedLevels, nextLevel];
        setUnlockedLevels(newUnlockedLevels);
        saveUnlockedLevels(newUnlockedLevels);
        
        Alert.alert(
          'Level Unlocked!',
          `You've unlocked the ${nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)} level!`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setScore(0);
    setRound(0);
    setGameStarted(true);
    nextWord(selectedDifficulty);
  };

  const nextWord = (wordDifficulty = difficulty) => {
    const wordList = WORD_LISTS[wordDifficulty];
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const wordObj = wordList[randomIndex];
    
    setCurrentWordObj(wordObj);
    
    // Shuffle the options
    const shuffled = [...wordObj.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    
    setRound(prevRound => prevRound + 1);
    
    // Save progress after each word
    saveGameProgress();
  };

  const playSound = async (isCorrect) => {
    try {
      if (isCorrect && correctSound) {
        await correctSound.replayAsync();
      } else if (!isCorrect && incorrectSound) {
        await incorrectSound.replayAsync();
      }
    } catch (error) {
      console.error('Failed to play sound', error);
    }
  };

  const showAnimation = (isCorrect) => {
    // Set the animation source based on whether the answer is correct or not
    const source = isCorrect 
      ? require('./assets/correct.json') 
      : require('./assets/incorrect.json');
    
    setAnimationSource(source);
    setAnimationVisible(true);
    
    // Hide the animation after a delay
    setTimeout(() => {
      setAnimationVisible(false);
    }, 2000);
  };

  const checkAnswer = (selectedOption) => {
    const isCorrect = selectedOption === currentWordObj.word;
    
    // Play sound and show animation
    playSound(isCorrect);
    showAnimation(isCorrect);
    
    if (isCorrect) {
      // Correct answer
      const newScore = score + getScoreForDifficulty();
      setScore(newScore);
      
      // Check if this is a new high score
      if (newScore > highScore) {
        setHighScore(newScore);
        saveHighScore(newScore);
      }
      
      // Check if player should unlock next level
      if (round % 5 === 0 && score >= 10) {
        unlockNextLevel();
      }
      
      // Wait for animation to finish before moving to next word
      setTimeout(() => {
        nextWord();
      }, 1500);
    } else {
      // Wrong answer - show correct answer
      setTimeout(() => {
        Alert.alert('Incorrect', `The correct spelling is: ${currentWordObj.word}`, [
          {text: 'Next Word', onPress: () => nextWord()}
        ]);
      }, 1500);
    }
  };

  const getScoreForDifficulty = () => {
    switch(difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      case 'expert': return 5;
      default: return 1;
    }
  };

  const endGame = () => {
    Alert.alert(
      'Game Over',
      `Your final score: ${score}`,
      [
        {
          text: 'Play Again',
          onPress: () => startGame(difficulty)
        },
        {
          text: 'Main Menu',
          onPress: () => setGameStarted(false)
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Spelling Game...</Text>
      </View>
    );
  }

  if (!gameStarted) {
    return (
      <PaperProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Spelling Master</Text>
            <Text style={styles.subtitle}>Test your spelling skills!</Text>
          </View>
          
          <View style={styles.highScoreContainer}>
            <Text style={styles.highScoreText}>High Score: {highScore}</Text>
          </View>
          
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyTitle}>Select Difficulty:</Text>
            <TouchableOpacity 
              style={[styles.difficultyButton, styles.easyButton]} 
              onPress={() => startGame('easy')}
            >
              <Text style={styles.buttonText}>Easy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.difficultyButton, 
                styles.mediumButton,
                !unlockedLevels.includes('medium') && styles.lockedButton
              ]} 
              disabled={!unlockedLevels.includes('medium')}
              onPress={() => startGame('medium')}
            >
              <Text style={styles.buttonText}>
                Medium {!unlockedLevels.includes('medium') && '🔒'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.difficultyButton, 
                styles.hardButton,
                !unlockedLevels.includes('hard') && styles.lockedButton
              ]} 
              disabled={!unlockedLevels.includes('hard')}
              onPress={() => startGame('hard')}
            >
              <Text style={styles.buttonText}>
                Hard {!unlockedLevels.includes('hard') && '🔒'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.difficultyButton, 
                styles.expertButton,
                !unlockedLevels.includes('expert') && styles.lockedButton
              ]} 
              disabled={!unlockedLevels.includes('expert')}
              onPress={() => startGame('expert')}
            >
              <Text style={styles.buttonText}>
                Expert {!unlockedLevels.includes('expert') && '🔒'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to Play:</Text>
            <Text style={styles.instructionsText}>
              1. Choose the correct spelling from the options{'\n'}
              2. Score points for each correct answer{'\n'}
              3. Unlock new difficulty levels as you progress
            </Text>
          </View>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.gameHeader}>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.roundText}>Round: {round}</Text>
          <Text style={styles.difficultyText}>
            Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Text>
        </View>
        
        <View style={styles.gameContainer}>
          <Text style={styles.instructionText}>Choose the correct spelling:</Text>
          
          <View style={styles.wordContainer}>
            <Image 
              source={{ uri: `https://source.unsplash.com/300x200/?${currentWordObj?.word}` }} 
              style={styles.wordImage}
              resizeMode="cover"
            />
          </View>
          
          <View style={styles.optionsContainer}>
            {shuffledOptions.map((option, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.optionButton} 
                onPress={() => checkAnswer(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {animationVisible && (
            <View style={styles.animationContainer}>
              <LottieView
                ref={animation => setAnimation(animation)}
                source={animationSource}
                autoPlay
                loop={false}
                style={styles.animation}
              />
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.endGameButton} 
            onPress={endGame}
          >
            <Text style={styles.endGameButtonText}>End Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </PaperProvider> //o
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  highScoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  highScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  difficultyContainer: {
    alignItems: 'center',
    padding: 10,
  },
  difficultyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  difficultyButton: {
    width: 200,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  easyButton: {
    backgroundColor: '#4CAF50',
  },
  mediumButton: {
    backgroundColor: '#FF9800',
  },
  hardButton: {
    backgroundColor: '#F44336',
  },
  expertButton: {
    backgroundColor: '#673AB7',
  },
  lockedButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    padding: 20,
    marginTop: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    marginHorizontal: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E7D32',
  },
  instructionsText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  roundText: {
    fontSize: 16,
    color: '#333',
  },
  difficultyText: {
    fontSize: 16,
    color: '#FF9800',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  wordContainer: {
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  wordImage: {
    width: 300,
    height: 200,
    borderRadius: 15,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  optionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 10,
  },
  animation: {
    width: 200,
    height: 200,
  },
  endGameButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginTop: 20,
  },
  endGameButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});