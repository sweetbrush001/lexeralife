import { NativeModules, Platform } from 'react-native';

/**
 * Apply patches to React Native runtime to fix common issues
 * Including the "topInsetsChange" error
 */
export function applyReactNativePatches() {
  // Fix for topInsetsChange error
  if (Platform.OS === 'ios' && NativeModules.RCTDeviceEventEmitter) {
    const originalEmit = NativeModules.RCTDeviceEventEmitter.emit;
    
    // Override the emit method to catch problematic events
    NativeModules.RCTDeviceEventEmitter.emit = function(eventType, ...args) {
      if (eventType === 'topInsetsChange') {
        console.log('Intercepted topInsetsChange event to prevent error');
        return;
      }
      return originalEmit.call(this, eventType, ...args);
    };
  }
  
  console.log('React Native patches applied successfully');
}

export default applyReactNativePatches;
