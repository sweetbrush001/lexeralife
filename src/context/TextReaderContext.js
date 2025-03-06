import React, { createContext, useState, useContext, useCallback } from 'react';

const TextReaderContext = createContext();

export const TextReaderProvider = ({ children }) => {
  const [readableElements, setReadableElements] = useState({});
  const [readingOrder, setReadingOrder] = useState([]);
  
  const registerReadableText = useCallback((id, text, priority = 100) => {
    if (id && text) {
      setReadableElements(prev => {
        // Only update if the text has changed
        if (prev[id] !== text) {
          return {
            ...prev,
            [id]: text
          };
        }
        return prev;
      });
      
      // Add to reading order if not already there
      setReadingOrder(prev => {
        const existing = prev.findIndex(item => item.id === id);
        if (existing >= 0) {
          // Update priority if it exists
          const newOrder = [...prev];
          newOrder[existing] = { id, priority };
          return newOrder.sort((a, b) => a.priority - b.priority);
        } else {
          // Add new item and sort
          return [...prev, { id, priority }].sort((a, b) => a.priority - b.priority);
        }
      });
    }
  }, []);
  
  const unregisterReadableText = useCallback((id) => {
    if (id) {
      setReadableElements(prev => {
        if (prev[id]) {
          const newElements = { ...prev };
          delete newElements[id];
          return newElements;
        }
        return prev;
      });
      
      // Remove from reading order
      setReadingOrder(prev => prev.filter(item => item.id !== id));
    }
  }, []);
  
  const getAllReadableText = useCallback(() => {
    // Return text in the specified reading order
    return readingOrder
      .map(item => readableElements[item.id])
      .filter(Boolean)
      .join(' ');
  }, [readableElements, readingOrder]);
  
  const value = React.useMemo(() => ({
    registerReadableText,
    unregisterReadableText,
    getAllReadableText
  }), [registerReadableText, unregisterReadableText, getAllReadableText]);
  
  return (
    <TextReaderContext.Provider value={value}>
      {children}
    </TextReaderContext.Provider>
  );
};

export const useTextReader = () => useContext(TextReaderContext);
