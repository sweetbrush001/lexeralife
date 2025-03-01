import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BlankWord = ({ word, sentence }) => {
  // Replace the blank with underscores matching the word length
  const renderSentence = () => {
    if (!sentence) return null;
    
    // Replace the blank with underscores
    const blankPattern = /___/;
    const parts = sentence.split(blankPattern);
    
    if (parts.length === 1) {
      // If no ___ pattern found, look for single underscore
      const singleBlankPattern = /_/;
      const singleParts = sentence.split(singleBlankPattern);
      
      if (singleParts.length === 1) {
        return <Text style={styles.sentenceText}>{sentence}</Text>;
      }
      
      return (
        <Text style={styles.sentenceText}>
          {singleParts[0]}
          <Text style={styles.blankText}>{'_'.repeat(word ? word.length : 5)}</Text>
          {singleParts[1]}
        </Text>
      );
    }
    
    return (
      <Text style={styles.sentenceText}>
        {parts[0]}
        <Text style={styles.blankText}>{'_'.repeat(word ? word.length : 5)}</Text>
        {parts[1]}
      </Text>
    );
  };
  
  return (
    <View style={styles.container}>
      {renderSentence()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 10,
  },
  sentenceText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    color: '#333',
  },
  blankText: {
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
});

export default BlankWord;