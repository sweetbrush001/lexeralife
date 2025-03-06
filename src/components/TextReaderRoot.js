import React from 'react';
import { View } from 'react-native';
import { TextReaderProvider } from '../context/TextReaderContext';
import TTSVoiceButton from './TTSVoiceButton';

const TextReaderRoot = ({ children, style }) => {
  return (
    <TextReaderProvider>
      <View style={[{ flex: 1 }, style]}>
        {children}
        <TTSVoiceButton />
      </View>
    </TextReaderProvider>
  );
};

export default TextReaderRoot;
