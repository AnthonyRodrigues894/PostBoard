import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
 
// Importa as telas
import FeedScreen       from '../screens/FeedScreen';
import DetalhesScreen   from '../screens/DetalhesScreen';
import FormularioScreen from '../screens/FormularioScreen';
 
// Cria as instâncias dos navegadores
const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();
 
// ─── Stack Navigator da aba Feed ───────────────────────────
// Agrupa FeedScreen e DetalhesScreen em um fluxo linear
function FeedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1e3a5f' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ title: 'PostBoard' }}
      />
      <Stack.Screen
        name="Detalhes"
        component={DetalhesScreen}
        options={{ title: 'Detalhes do Post' }}
      />
    </Stack.Navigator>
  );
}
 
// ─── Bottom Tab Navigator (raiz) ───────────────────────────
// Define as abas principais do aplicativo
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,   // O Stack já mostra o header
        tabBarActiveTintColor: '#1a56db',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        // Ícone de cada aba usando emoji (sem dependência extra)
        tabBarIcon: ({ focused }) => {
          const icones = {
            FeedTab:       focused ? '📋' : '📄',
            FormularioTab: focused ? '✏️' : '📝',
          };
          return <Text style={{ fontSize: 22 }}>{icones[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedStack}
        options={{ tabBarLabel: 'Posts' }}
      />
      <Tab.Screen
        name="FormularioTab"
        component={FormularioScreen}
        options={{
          tabBarLabel: 'Novo Post',
          title: 'Novo Post',
          headerShown: true,
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#ffffff',
        }}
      />
    </Tab.Navigator>
  );
}
