import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CreativityScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Creativity Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreativityScreen; 