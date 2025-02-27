import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OrbitLoader from './OrbitLoader';

const LoadingScreen = ({ 
  message = 'Loading...', 
  size = 45, 
  color = '#0066FF',
  overlay = false 
}) => {
  return (
    <View style={[
      styles.container, 
      overlay && styles.overlay
    ]}>
      <View style={styles.loaderBox}>
        <OrbitLoader size={size} color={color} />
        <Text style={[styles.message, { color }]}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 999,
  },
  loaderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  }
});

export default LoadingScreen;