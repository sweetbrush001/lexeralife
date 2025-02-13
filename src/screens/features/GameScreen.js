import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

const GameScreen = () => {
  return (
    <ImageBackground
      source={require('../../../assets/background.png')} // Replace with your background image path
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.text}>Game Screen</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: '#fff', // Make sure text is visible on top of the background
    fontWeight: 'bold',
  },
});

export default GameScreen;
