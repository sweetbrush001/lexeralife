import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';

const relaxSlides = [
  {
    id: '1',
    title: 'Find Your Calm',
    description: 'Welcome to the Relax zone, your personal sanctuary for peace and mindfulness.',
    lottieUrl: 'https://assets9.lottiefiles.com/packages/lf20_zrqthn6o.json', // Meditation animation
    icon: 'spa'
  },
  {
    id: '2',
    title: 'Soothing Sounds',
    description: 'Discover a collection of calming audio tracks designed to help you relax, focus, or sleep better.',
    lottieUrl: 'https://assets3.lottiefiles.com/packages/lf20_obhph3sh.json', // Sound waves
    icon: 'headphones'
  },
  {
    id: '3',
    title: 'Set Your Timer',
    description: 'Create the perfect relaxation session with customizable timers. Your audio will automatically stop when the time is up.',
    lottieUrl: 'https://assets5.lottiefiles.com/packages/lf20_kqSJlF.json', // Timer animation
    icon: 'clock'
  },
];

const RelaxIntroScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Home');
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleComplete = () => {
    navigation.navigate('Relax');
  };

  return (
    <FeatureIntroScreen
      slides={relaxSlides}
      featureKey="relax"
      onComplete={handleComplete}
      colors={['#FF9999', '#FF5E62']} // Pink/Red theme matching relax screen
    />
  );
};

export default RelaxIntroScreen;
