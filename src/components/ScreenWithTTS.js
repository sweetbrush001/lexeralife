import React from 'react';
import { View, StyleSheet } from 'react-native';
import TTSVoiceButton from './TTSVoiceButton';
import { TextReaderProvider } from '../context/TextReaderContext';

/**
 * Wrapper component to add TTS functionality to any screen
 * Usage: <ScreenWithTTS>{yourScreenContent}</ScreenWithTTS>
 */
const ScreenWithTTS = ({ children, style }) => {
  return (
    <TextReaderProvider>
      <View style={[styles.container, style]}>
        {children}
        <TTSVoiceButton />
      </View>
    </TextReaderProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenWithTTS;
