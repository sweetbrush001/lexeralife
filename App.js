import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import GenerateFlashcardScreen from './screens/GenerateFlashcardScreen';
import FlashcardListScreen from './screens/FlashcardListScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="GenerateFlashcards" component={GenerateFlashcardScreen} />
        <Stack.Screen name="FlashcardList" component={FlashcardListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;