import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Telas
import FeedScreen       from '../screens/FeedScreen';
import DetalhesScreen   from '../screens/DetalhesScreen';
import FormularioScreen from '../screens/FormularioScreen';
import CacheScreen      from '../screens/CacheScreen'; // ✅ NOVO

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Stack do Feed ───────────────────────────────────────
function FeedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#064e3b' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold', color: '#d1fae5' },
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

// ─── Tabs principais ─────────────────────────────────────
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },

        // Ícones
        tabBarIcon: ({ focused }) => {
          const icones = {
            FeedTab:       focused ? '📋' : '📄',
            FormularioTab: focused ? '✏️' : '📝',
            CacheTab:      focused ? '🗄️' : '📦', // ✅ NOVO
          };

          return <Text style={{ fontSize: 22 }}>{icones[route.name]}</Text>;
        },
      })}
    >
      {/* Feed */}
      <Tab.Screen
        name="FeedTab"
        component={FeedStack}
        options={{ tabBarLabel: 'Posts' }}
      />

      {/* Formulário */}
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

      {/* ✅ Cache */}
      <Tab.Screen
        name="CacheTab"
        component={CacheScreen}
        options={{
          tabBarLabel: 'Cache',
          title: 'Cache',
          headerShown: true,
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#ffffff',
        }}
      />
    </Tab.Navigator>
  );
}