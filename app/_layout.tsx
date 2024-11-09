import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import { useColorScheme } from "@/hooks/useColorScheme";

const client = new ApolloClient({
  uri: "https://be.ilearnquran.org/graphql",
  cache: new InMemoryCache(),
  // headers: {
  //   Authorization:
  //     "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjVkZmY3Y2QxNGU1ODRmY2JhNmIxMjc3MzExNTMxOSIsImV4cCI6MTczMDUzOTU3OCwib3JpZ0lhdCI6MTczMDUzOTI3OH0.S-R78dL7pI09fB21Il00GjDER4rDHpnBGoPiq-RWYtQ",
  // },
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </ApolloProvider>
  );
}
