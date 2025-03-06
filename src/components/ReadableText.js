import React, { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import { useTextReader } from '../context/TextReaderContext';

const ReadableText = ({ 
  children, 
  style, 
  readable = false, // Default to NOT readable
  priority = 100, // Default priority (lower numbers are read first)
  ...props 
}) => {
  const { registerReadableText, unregisterReadableText } = useTextReader();
  
  // Use a ref to store the ID
  const idRef = useRef(`text_${Math.random().toString(36).substr(2, 9)}`);
  
  // Store the previous text to compare
  const prevTextRef = useRef();
  const prevReadableRef = useRef(readable);
  
  useEffect(() => {
    const textContent = typeof children === 'string' ? children : '';
    
    // Register if readable and text has content
    if (readable && textContent) {
      if (textContent !== prevTextRef.current || prevReadableRef.current !== readable) {
        registerReadableText(idRef.current, textContent, priority);
        prevTextRef.current = textContent;
        prevReadableRef.current = readable;
      }
    } else if (prevReadableRef.current && !readable) {
      // If it was previously readable but now isn't
      unregisterReadableText(idRef.current);
      prevReadableRef.current = readable;
      prevTextRef.current = null;
    }
    
    return () => {
      if (idRef.current) {
        unregisterReadableText(idRef.current);
      }
    };
  }, [children, readable, priority, registerReadableText, unregisterReadableText]);
  
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
};

export default React.memo(ReadableText);
