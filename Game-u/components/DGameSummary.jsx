import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground,
  Animated,
  Easing
} from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from '../utils/mock-haptics';

const GameSummary = ({ score, difficulty, onPlayAgain, onBackToMenu }) => {
  const animation = useRef(null);
  const scoreAnim = useRef(new Animated.Value(0)).current;
  
  // Get high score from storage (hardcoded for now)
  const highScore = 500;
  
  useEffect(() => {
    // Play animation
    if (animation.current) {
      animation.current.play();
    }
    
    // Animate score counting up
    Animated.timing(scoreAnim, {
      toValue: score,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  
  // Format difficulty for display
  const formatDifficulty = (diff) => {
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  };
  
  return (
    <ImageBackground 
      source={require('./assets/images/ocean_background.jpg')} 
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Game Complete!</Text>
        
        <LottieView
          ref={animation}
          source={require('./assets/animations/trophy.json')}
          style={styles.animation}
          loop={false}
        />
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Your Score:</Text>
          <Animated.Text style={styles.scoreValue}>
            {scoreAnim.interpolate({
              inputRange: [0, score],
              outputRange: [0, score],
              extrapolate: 'clamp',
            }).interpolate(value => Math.floor(value))}
          </Animated.Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Difficulty:</Text>
            <Text style={styles.statValue}>{formatDifficulty(difficulty)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>High Score:</Text>
            <Text style={styles.statValue}>{highScore}</Text>
          </View>
        </View>
        
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          <View style={styles.leaderboardItem}>
            <Text style={styles.leaderboardRank}>1.</Text>
            <Text style={styles.leaderboardName}>You</Text>
            <Text style={styles.leaderboardScore}>{highScore}</Text>
          </View>
          <View style={styles.leaderboardItem}>
            <Text style={styles.leaderboardRank}>2.</Text>
            <Text style={styles.leaderboardName}>You</Text>
            <Text style={styles.leaderboardScore}>{score < highScore ? score : Math.floor(highScore * 0.8)}</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.playAgainButton]} 
            onPress={onPlayAgain}
          >
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.menuButton]} 
            onPress={onBackToMenu}
          >
            <Text style={styles.buttonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontFamily: 'OpenDyslexic-Bold',
  },
  animation: {
    width: 150,
    height: 150,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
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
});

export default GameSummary;