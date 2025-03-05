import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';
import { markFeatureIntroAsSeenInFirebase } from '../../utils/userFirebaseUtils';

const testIntroSlides = [
  {
    id: '1',
    title: 'Dyslexia Screening',
    description: 'Welcome to our comprehensive dyslexia screening tool, designed to help identify potential reading difficulties.',
    lottieUrl: 'https://assets4.lottiefiles.com/packages/lf20_qvhuluad.json', // Brain or reading animation
    icon: 'book-reader'
  },
  {
    id: '2',
    title: 'Personalized Assessment',
    description: 'Our test adapts to your responses and provides a detailed analysis of your reading patterns.',
    lottieUrl: 'https://assets5.lottiefiles.com/packages/lf20_qwbjamol.json', // Checklist animation
    icon: 'clipboard-check'
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'Take the test multiple times to track your improvement over time. View your results history anytime.',
    lottieUrl: 'https://assets6.lottiefiles.com/packages/lf20_nprn1lbd.json', // Chart growing
    icon: 'chart-line'
  },
];

const TestIntroScreen = () => {
  const navigation = useNavigation();
  
  // Mark feature as seen when completed
  const handleComplete = () => {
    console.log('[TestIntro] Intro completed, navigating to Test screen');
    
    // Mark this intro as seen in Firebase
    markFeatureIntroAsSeenInFirebase('test')
      .catch(err => console.error('Error marking test intro as seen:', err));
    
    // Navigate to the test screen
    navigation.navigate('TestIntro');
  };

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        console.log('[TestIntro] Back button pressed, marking as seen');
        
        markFeatureIntroAsSeenInFirebase('test')
          .catch(err => console.error('Error marking test intro as seen:', err));
        
        navigation.navigate('Home');
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Mark as seen on unmount
  useEffect(() => {
    return () => {
      console.log('[TestIntro] Screen unmounting, marking as seen');
      
      markFeatureIntroAsSeenInFirebase('test')
        .catch(err => console.error('Error marking test intro as seen on unmount:', err));
    };
  }, []);

  return (
    <FeatureIntroScreen
      slides={testIntroSlides}
      featureKey="test"
      onComplete={handleComplete}
      colors={['#4158D0', '#C850C0']} // Purple/blue gradient for test
    />
  );
};

export default TestIntroScreen;
