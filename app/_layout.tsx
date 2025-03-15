import React, { useState, useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import NetInfo from "@react-native-community/netinfo";
import { View, Text, StyleSheet } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";

/**
 * Apollo Client setup for GraphQL API.
 */
const client = new ApolloClient({
  uri: "https://be.ilearnquran.org/graphql",
  cache: new InMemoryCache(),
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * No Internet Connection Banner
 */
const NoInternetBanner = () => {
  return (
    <View style={styles.noInternetContainer}>
      <Text style={styles.noInternetText}>ليس هنالك إنترنت</Text>
    </View>
  );
};

/**
 * Root layout component for the application.
 * 
 * @returns {JSX.Element | null} The root layout component.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Amiri: require("../assets/fonts/Amiri-Regular.ttf"),
    Kufi: require("../assets/fonts/Kufi.ttf"),
  });

  useEffect(() => {
    // Set up network connectivity listener
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    if (loaded) {
      SplashScreen.hideAsync();
    }

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {!isConnected && <NoInternetBanner />}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  noInternetContainer: {
    backgroundColor: "#f44336",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 999,
  },
  noInternetText: {
    color: "white",
    fontWeight: "bold",
  },
});
