import { Tabs } from 'expo-router';
import { Home, TrendingUp } from 'lucide-react-native';
import React from 'react';

import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6', // Premium Blue
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 20,
          color: '#0f172a',
        },
        headerShown: true, // Keep it true for Android look
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

