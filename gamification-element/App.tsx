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
  Image,
  ActivityIndicator
} from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Word lists by difficulty
const WORD_LISTS = {
  easy: [
    'cat', 'dog', 'run', 'jump', 'play', 
    'red', 'blue', 'green', 'sun', 'moon',
    'book', 'pen', 'hat', 'ball', 'fish'
  ],
  medium: [
    'apple', 'banana', 'orange', 'school', 'friend',
    'happy', 'water', 'paper', 'music', 'garden',
    'window', 'pencil', 'flower', 'summer', 'winter'
  ],
  hard: [
    'elephant', 'beautiful', 'computer', 'adventure', 'chocolate',
    'dinosaur', 'butterfly', 'calendar', 'different', 'important',
    'vegetable', 'umbrella', 'mountain', 'language', 'question'
  ]
};

export default function App() {
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [round, setRound] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load high score on app start
  useEffect(() => {
    loadHighScore();
  }, []);

  const loadHighScore = async () => {
    try {
      const savedHighScore = await AsyncStorage.getItem('highScore');
      if (savedHighScore !== null) {
        setHighScore(parseInt(savedHighScore));
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load high score', error);
      setLoading(false);
    }
  };

  const saveHighScore = async (newHighScore: number) => {
    try {
      await AsyncStorage.setItem('highScore', newHighScore.toString());
    } catch (error) {
      console.error('Failed to save high score', error);
    }
  };

  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDifficulty);
    setScore(0);
    setRound(0);
    setGameStarted(true);
    nextWord(selectedDifficulty);
  };

  const nextWord = (wordDifficulty = difficulty) => {
    const words = WORD_LISTS[wordDifficulty as keyof typeof WORD_LISTS];
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];
    setCurrentWord(word);
    setUserInput('');
    setRound(prevRound => prevRound + 1);
    
    // Speak the word
    speakWord(word);
  };

  const speakWord = (word: string) => {
    const options = {
      rate: difficulty === 'hard' ? 0.8 : 1,
      pitch: 1,
      language: 'en-US'
    };
    Speech.speak(word, options);
  };

  const checkAnswer = () => {
    if (userInput.trim().toLowerCase() === currentWord.toLowerCase()) {
      // Correct answer
      const newScore = score + 1;
      setScore(newScore);
      
      // Check if this is a new high score
      if (newScore > highScore) {
        setHighScore(newScore);
        saveHighScore(newScore);
      }
      
      Alert.alert('Correct!', 'Great job!', [
        {text: 'Next Word', onPress: () => nextWord()}
      ]);
    } else {
      // Wrong answer
      Alert.alert('Incorrect', `The correct spelling is: ${currentWord}`, [
        {text: 'Next Word', onPress: () => nextWord()}
      ]);
    }
  };

  const repeatWord = () => {
    speakWord(currentWord);
  };

  const endGame = () => {
    Alert.alert(
      'Game Over',
      `Your final score: ${score}`,
      [
        {
          text: 'Play Again',
          onPress: () => startGame(difficulty as 'easy' | 'medium' | 'hard')
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
            style={[styles.difficultyButton, styles.mediumButton]} 
            onPress={() => startGame('medium')}
          >
            <Text style={styles.buttonText}>Medium</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.difficultyButton, styles.hardButton]} 
            onPress={() => startGame('hard')}
          >
            <Text style={styles.buttonText}>Hard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
    marginBottom: 40,
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
    marginBottom: 40,
  },
  highScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  difficultyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  difficultyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  difficultyButton: {
    width: 200,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
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
  instructionText: {
    fontSize: 22,
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  speakButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 30,
    marginBottom: 30,
  },
  speakButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    width: '90%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  gameButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 30,
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
});