import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameEngine } from 'react-native-game-engine';

// Word lists by difficulty with sentences and blanks
const WORD_LISTS = {
  easy: [
    { word: 'cat', sentence: 'The ___ chased the mouse.', hint: 'A small furry pet that meows' },
    { word: 'dog', sentence: 'The ___ barked at the mailman.', hint: 'Man\'s best friend' },
    { word: 'run', sentence: 'I like to ___ in the park.', hint: 'Moving fast on foot' },
    { word: 'jump', sentence: 'Frogs can ___ very high.', hint: 'To push oneself off a surface' },
    { word: 'play', sentence: 'Children ___ in the playground.', hint: 'To engage in activity for fun' },
    { word: 'red', sentence: 'The apple is ___.', hint: 'The color of a stop sign' },
    { word: 'blue', sentence: 'The sky is ___.', hint: 'The color of the ocean' },
    { word: 'green', sentence: 'The grass is ___.', hint: 'The color of leaves' },
    { word: 'sun', sentence: 'The ___ rises in the east.', hint: 'A star that gives us light during the day' },
    { word: 'moon', sentence: 'The ___ shines at night.', hint: 'It orbits around Earth' }
  ],
  medium: [
    { word: 'apple', sentence: 'An ___ a day keeps the doctor away.', hint: 'A round fruit, often red or green' },
    { word: 'banana', sentence: 'Monkeys like to eat ___s.', hint: 'A yellow curved fruit' },
    { word: 'orange', sentence: 'I drink ___ juice for breakfast.', hint: 'A citrus fruit with the same name as a color' },
    { word: 'school', sentence: 'Children go to ___ to learn.', hint: 'A place of education' },
    { word: 'friend', sentence: 'A ___ is someone you can trust.', hint: 'A person you like and enjoy spending time with' },
    { word: 'happy', sentence: 'I feel ___ when I get a present.', hint: 'Feeling joy or pleasure' },
    { word: 'water', sentence: 'We drink ___ to stay hydrated.', hint: 'H2O' },
    { word: 'paper', sentence: 'We write on ___.', hint: 'Made from trees, used for writing' },
    { word: 'music', sentence: 'I listen to ___ on my headphones.', hint: 'Sounds organized in time' },
    { word: 'garden', sentence: 'Flowers grow in the ___.', hint: 'An area where plants are grown' }
  ],
  hard: [
    { word: 'elephant', sentence: 'An ___ never forgets.', hint: 'The largest land animal with a trunk' },
    { word: 'beautiful', sentence: 'The sunset was ___.', hint: 'Pleasing to the senses or mind' },
    { word: 'computer', sentence: 'I use a ___ to browse the internet.', hint: 'An electronic device for processing data' },
    { word: 'adventure', sentence: 'We went on an ___ in the forest.', hint: 'An exciting or unusual experience' },
    { word: 'chocolate', sentence: '___ is made from cocoa beans.', hint: 'A sweet brown food made from cacao seeds' },
    { word: 'dinosaur', sentence: 'The ___ lived millions of years ago.', hint: 'Extinct reptiles that dominated Earth' },
    { word: 'butterfly', sentence: 'The ___ has colorful wings.', hint: 'An insect with large, often brightly colored wings' },
    { word: 'calendar', sentence: 'I marked the date on my ___.', hint: 'Shows days, weeks, and months of a year' },
    { word: 'different', sentence: 'My twin and I look ___ from each other.', hint: 'Not the same' },
    { word: 'important', sentence: 'Education is ___ for success.', hint: 'Of great significance or value' }
  ],
  expert: [
    { word: 'extraordinary', sentence: 'The performance was ___.', hint: 'Very unusual or remarkable' },
    { word: 'sophisticated', sentence: 'The ___ system prevented any errors.', hint: 'Developed to a high degree of complexity' },
    { word: 'phenomenon', sentence: 'Scientists studied the unusual ___.', hint: 'A fact or situation observed to exist' },
    { word: 'conscientious', sentence: 'She is a ___ worker who pays attention to detail.', hint: 'Careful and thorough' },
    { word: 'enthusiastic', sentence: 'The fans were ___ about the team\'s victory.', hint: 'Having or showing intense interest' },
    { word: 'surveillance', sentence: 'The building is under 24-hour ___.', hint: 'Close observation of a person or group' },
    { word: 'catastrophe', sentence: 'The earthquake was a natural ___.', hint: 'An event causing great damage or suffering' },
    { word: 'psychology', sentence: 'She studied ___ at university.', hint: 'The study of mind and behavior' },
    { word: 'acquaintance', sentence: 'He is just an ___, not a close friend.', hint: 'A person one knows slightly' },
    { word: 'pronunciation', sentence: 'The correct ___ of this word is difficult.', hint: 'The way a word is spoken' }
  ]
};

// Game engine systems
const BlankWordSystem = (entities, { time }) => {
  // Animation logic for the blank word system
  return entities;
};

// Game engine renderer component
const BlankWord = ({ word, sentence }) => {
  return (
    <View style={styles.blankWordContainer}>
      <Text style={styles.sentenceText}>{sentence}</Text>
    </View>
  );
};

export default function App() {
  const [currentWordObj, setCurrentWordObj] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [round, setRound] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [gameMode, setGameMode] = useState('listen'); // 'listen' or 'fillBlanks'
  const [unlockedLevels, setUnlockedLevels] = useState(['easy']);
  const [gameEngineRunning, setGameEngineRunning] = useState(false);
  const [entities, setEntities] = useState({
    word: { 
      id: 'word', 
      word: '', 
      sentence: '',
      renderer: <BlankWord />
    }
  });

  // Load saved data on app start
  useEffect(() => {
    loadSavedData();
  }, []);

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

  const startGame = (selectedDifficulty, selectedMode) => {
    setDifficulty(selectedDifficulty);
    setGameMode(selectedMode);
    setScore(0);
    setRound(0);
    setGameStarted(true);
    setGameEngineRunning(selectedMode === 'fillBlanks');
    nextWord(selectedDifficulty);
  };

  const nextWord = (wordDifficulty = difficulty) => {
    const wordList = WORD_LISTS[wordDifficulty];
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const wordObj = wordList[randomIndex];
    
    setCurrentWordObj(wordObj);
    setUserInput('');
    setRound(prevRound => prevRound + 1);
    setShowHint(false);
    
    // Save progress after each word
    saveGameProgress();
    
    // Update game engine entities if in fill blanks mode
    if (gameMode === 'fillBlanks') {
      setEntities({
        word: {
          ...entities.word,
          word: wordObj.word,
          sentence: wordObj.sentence
        }
      });
    } else {
      // Speak the word in listen mode
      speakWord(wordObj.word);
    }
  };

  const speakWord = (word) => {
    const options = {
      rate: difficulty === 'hard' || difficulty === 'expert' ? 0.8 : 1,
      pitch: 1,
      language: 'en-US'
    };
    Speech.speak(word, options);
  };

  const checkAnswer = () => {
    if (userInput.trim().toLowerCase() === currentWordObj.word.toLowerCase()) {
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
      
      Alert.alert('Correct!', 'Great job!', [
        {text: 'Next Word', onPress: () => nextWord()}
      ]);
    } else {
      // Wrong answer
      Alert.alert('Incorrect', `The correct spelling is: ${currentWordObj.word}`, [
        {text: 'Next Word', onPress: () => nextWord()}
      ]);
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

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const repeatWord = () => {
    if (gameMode === 'listen') {
      speakWord(currentWordObj.word);
    }
  };

  const endGame = () => {
    Alert.alert(
      'Game Over',
      `Your final score: ${score}`,
      [
        {
          text: 'Play Again',
          onPress: () => startGame(difficulty, gameMode)
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Lexera Spells</Text>
          <Text style={styles.subtitle}>Test your spelling skills!</Text>
        </View>
        
        <View style={styles.highScoreContainer}>
          <Text style={styles.highScoreText}>High Score: {highScore}</Text>
        </View>
        
        <View style={styles.modeContainer}>
          <Text style={styles.modeTitle}>Select Game Mode:</Text>
          <TouchableOpacity 
            style={[styles.modeButton, styles.listenButton]} 
            onPress={() => setGameMode('listen')}
          >
            <Text style={styles.buttonText}>Listen & Spell</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, styles.fillButton]} 
            onPress={() => setGameMode('fillBlanks')}
          >
            <Text style={styles.buttonText}>Fill in the Blanks</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyTitle}>Select Difficulty:</Text>
          <ScrollView contentContainerStyle={styles.difficultyButtonsContainer}>
            <TouchableOpacity 
              style={[styles.difficultyButton, styles.easyButton]} 
              onPress={() => startGame('easy', gameMode)}
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
              onPress={() => startGame('medium', gameMode)}
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
              onPress={() => startGame('hard', gameMode)}
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
              onPress={() => startGame('expert', gameMode)}
            >
              <Text style={styles.buttonText}>
                Expert {!unlockedLevels.includes('expert') && '🔒'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // Game screen for Listen & Spell mode
  if (gameMode === 'listen') {
    return (
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
          <Text style={styles.instructionText}>Spell the word you hear:</Text>
          
          <TouchableOpacity 
            style={styles.speakButton} 
            onPress={repeatWord}
          >
            <Text style={styles.speakButtonText}>🔊 Hear Word Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.hintButton} 
            onPress={toggleHint}
          >
            <Text style={styles.hintButtonText}>
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Text>
          </TouchableOpacity>
          
          {showHint && currentWordObj && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>{currentWordObj.hint}</Text>
            </View>
          )}
          
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type your answer here"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <View style={styles.gameButtonsContainer}>
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={checkAnswer}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={() => nextWord()}
            >
              <Text style={styles.buttonText}>Skip</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.endGameButton} 
            onPress={endGame}
          >
            <Text style={styles.endGameButtonText}>End Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Game screen for Fill in the Blanks mode
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.gameHeader}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.roundText}>Round: {round}</Text>
        <Text style={styles.difficultyText}>
          Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Text>
      </View>
      
      {gameEngineRunning ? (
        <GameEngine
          style={styles.gameEngine}
          systems={[BlankWordSystem]}
          entities={entities}
        />
      ) : (
        <View style={styles.gameContainer}>
          {currentWordObj && (
            <View style={styles.sentenceContainer}>
              <Text style={styles.instructionText}>Fill in the blank:</Text>
              <Text style={styles.sentenceText}>{currentWordObj.sentence}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.hintButton} 
            onPress={toggleHint}
          >
            <Text style={styles.hintButtonText}>
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Text>
          </TouchableOpacity>
          
          {showHint && currentWordObj && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>{currentWordObj.hint}</Text>
            </View>
          )}
          
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type the missing word"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <View style={styles.gameButtonsContainer}>
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={checkAnswer}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={() => nextWord()}
            >
              <Text style={styles.buttonText}>Skip</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.endGameButton} 
            onPress={endGame}
          >
            <Text style={styles.endGameButtonText}>End Game</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
  modeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modeButton: {
    width: 200,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  listenButton: {
    backgroundColor: '#2196F3',
  },
  fillButton: {
    backgroundColor: '#9C27B0',
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
  difficultyButtonsContainer: {
    alignItems: 'center',
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
    justifyContent: 'center',
  },
  gameEngine: {
    flex: 1,
  },
  instructionText: {
    fontSize: 22,
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  sentenceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sentenceText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
    lineHeight: 30,
  },
  speakButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 30,
    marginBottom: 15,
  },
  speakButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hintButton: {
    backgroundColor: '#9C27B0',
    padding: 10,
    borderRadius: 20,
    marginBottom: 15,
  },
  hintButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintContainer: {
    backgroundColor: '#E1BEE7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '90%',
  },
  hintText: {
    fontSize: 16,
    color: '#4A148C',
    textAlign: 'center',
  },
  input: {
    width: '90%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  gameButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  endGameButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  endGameButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  blankWordContainer: {
    padding: 20,
    alignItems: 'center',
  },
});