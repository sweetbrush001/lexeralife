import React from 'react';
import { View } from 'react-native';
import ReadableText from './ReadableText';

/**
 * A component that combines a title and content into a readable section.
 * The TTS will read the title followed by the content.
 */
const ReadableSection = ({ 
  title, 
  content, 
  titleStyle, 
  contentStyle, 
  containerStyle,
  readable = true 
}) => {
  return (
    <View style={containerStyle}>
      {title && (
        <ReadableText style={titleStyle} readable={readable}>
          {title}
        </ReadableText>
      )}
      {content && (
        <ReadableText style={contentStyle} readable={readable}>
          {content}
        </ReadableText>
      )}
    </View>
  );
};

export default ReadableSection;
