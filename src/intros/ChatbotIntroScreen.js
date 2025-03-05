import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';
import { markFeatureIntroAsSeen } from '../../utils/FeatureIntroUtils';
import { markFeatureIntroAsSeenInFirebase } from '../../utils/userFirebaseUtils';

const chatbotSlides = [
  {
    id: '1',
    title: 'Meet Lexera Bot',
    description: 'Your personal AI assistant designed specifically to help with dyslexia-friendly conversations.',
    lottieUrl: 'https://assets5.lottiefiles.com/packages/lf20_4tvaqupm.json', // Robot wave
    icon: 'robot'
  },
  {
    id: '2',
    title: 'Voice Conversations',
    description: 'Speak naturally with Lexera Bot! The voice recognition feature makes communication easier.',
    lottieUrl: 'https://assets9.lottiefiles.com/packages/lf20_vktmjpuk.json', // Voice recognition
    icon: 'microphone'
  },
  {
    id: '3',
    title: 'Get Answers & Support',
    description: 'Ask questions about dyslexia, get reading tips, or just chat for emotional support whenever you need it.',
    lottieUrl: 'https://assets5.lottiefiles.com/packages/lf20_ukjcyybw.json', // Question mark
    icon: 'question-circle'
  },
];

const ChatbotIntroScreen = () => {
  const navigation = useNavigation();

  // Handle back button to properly mark feature as seen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        console.log('[ChatbotIntro] Back button pressed, marking as seen');
        
        markFeatureIntroAsSeenInFirebase('chatbot')
          .catch(err => console.error('Error marking chatbot intro as seen:', err));
        
        navigation.navigate('Home');
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  // When user completes intro
  const handleComplete = () => {
    console.log('[ChatbotIntro] Intro completed, navigating to Chatbot');
    
    // Mark this intro as seen in Firebase
    markFeatureIntroAsSeenInFirebase('chatbot')
      .catch(err => console.error('Error marking chatbot intro as seen:', err));
    
    navigation.navigate('Chatbot');
  };

  // Also mark as seen on unmount
  useEffect(() => {
    return () => {
      console.log('[ChatbotIntro] Screen unmounting, marking as seen');
      
      markFeatureIntroAsSeenInFirebase('chatbot')
        .catch(err => console.error('Error marking chatbot intro as seen on unmount:', err));
    };
  }, []);

  return (
    <FeatureIntroScreen
      slides={chatbotSlides}
      featureKey="chatbot"
      onComplete={handleComplete}
      colors={['#A990FF', '#6B66FF']} // Purple theme matching chatbot
    />
  );
};

export default ChatbotIntroScreen;
