import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';

const gameSlides = [
  {
    id: '1',
    title: 'Brain Training Games',
    description: 'Fun and engaging games designed specifically to strengthen cognitive skills related to reading and comprehension.',
    lottieUrl: 'https://assets10.lottiefiles.com/packages/lf20_tsxbtrcu.json', // Brain animation
    icon: 'brain'
  },
  {
    id: '2',
    title: 'Track Your Progress',
    description: 'See how your skills improve over time with detailed progress tracking and performance insights.',
    lottieUrl: 'https://assets10.lottiefiles.com/private_files/lf30_ugedvpkw.json', // Progress chart
    icon: 'chart-line'
  },
  {
    id: '3',
    title: 'Challenge Yourself',
    description: 'Multiple difficulty levels ensure the games remain challenging as your skills improve.',
    lottieUrl: 'https://assets2.lottiefiles.com/packages/lf20_acky3hjj.json', // Level up
    icon: 'trophy'
  },
];

const GameIntroScreen = () => {
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
    navigation.navigate('Game');
  };

  return (
    <FeatureIntroScreen
      slides={gameSlides}
      featureKey="game"
      onComplete={handleComplete}
      colors={['#4CAF50', '#8BC34A']} // Green theme for brain training/games
    />
  );
};

export default GameIntroScreen;
