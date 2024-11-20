import { Stack } from 'expo-router';
import React from 'react';

import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Ayah',
        }}
      />
    </Stack>
  );
}
