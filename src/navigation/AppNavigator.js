import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import AuthNavigator from "./AuthNavigator";
import HomeScreen from "../screens/home/HomeScreen";
import GameScreen from "../screens/features/GameScreen";
import ChatbotScreen from "../screens/features/ChatbotScreen";
import CreativityScreen from "../screens/features/CreativityScreen";
import TestScreen from "../screens/features/testScreen/TestScreen";
import ResultsScreen from "../screens/features/testScreen/ResultsScreen"; // Correct import path
import PreviousResultsScreen from "../screens/features/testScreen/PreviousResultsScreen";
import TestIntroScreen from "../screens/features/testScreen/TestIntroScreen";
import SettingsScreen from "../screens/sidepanel/SettingsScreen";
import { SettingsProvider } from '../context/SettingsContext';
import CommunityPage from "../screens/features/community/CommunityPage";
import CreatePost from "../screens/features/community/CreatePost";
import ProfileSettingsScreen from "../screens/sidepanel/ProfileSettingsScreen";
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <SettingsProvider>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        <Stack.Screen name="Creativity" component={CreativityScreen} />
        <Stack.Screen name="Test" component={TestScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="PreviousResults" component={PreviousResultsScreen} />
        <Stack.Screen name="TestIntro" component={TestIntroScreen} />
        <Stack.Screen name="settings" component={SettingsScreen} />
        <Stack.Screen name="Community" component={CommunityPage} />
        <Stack.Screen name="CreatePost" component={CreatePost} />
        <Stack.Screen name="profile" component={ProfileSettingsScreen} />
      </Stack.Navigator>
    </SettingsProvider>
  );
};

export default AppNavigator;
