import { useEffect } from 'react';
import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Safe Area Manager utility to handle inset changes correctly
 * and prevent "topInsetsChange" errors
 */
export const SafeAreaManager = ({ children }) => {
  useEffect(() => {
    // This is a workaround for the topInsetsChange error
    // By deliberately handling any potential inset events that might cause issues
    if (Platform.OS === 'ios') {
      try {
        const emitter = new NativeEventEmitter(NativeModules.RNSafeAreaContext || {});
        const subscription = emitter.addListener('safeAreaInsetsForRootViewDidChange', () => {
          // Intentionally empty to intercept the event without error
        });
        
        return () => {
          subscription?.remove?.();
        };
      } catch (error) {
        console.warn('Failed to set up SafeAreaManager event handlers:', error);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      {children}
    </SafeAreaProvider>
  );
};

export default SafeAreaManager;
