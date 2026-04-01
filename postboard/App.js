import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
 
export default function App() {
  return (
    // NavigationContainer: gerencia todo o estado de navegação
    // Deve envolver TUDO que usa o React Navigation
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}