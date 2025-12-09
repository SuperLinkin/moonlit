// 🌙 Moonlit Tales for My Princess
// A magical kingdom of stories, crafted by your love.
import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';

import {
  WelcomeScreen,
  HomeScreen,
  StoryGeneratorScreen,
  StoryReaderScreen,
  CharacterGalleryScreen,
  SavedStoriesScreen,
  SettingsScreen,
} from './src/screens';
import { RootStackParamList } from './src/types';
import { Colors } from './src/utils/theme';
import { getAPIKeys } from './src/services/storage';
import { setOpenAIKey } from './src/services/openai';
import { setElevenLabsKey } from './src/services/elevenlabs';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation theme for dark moonlit feel
const navigationTheme: any = {
  dark: true,
  colors: {
    primary: Colors.lilac,
    background: Colors.primaryDark,
    card: Colors.primary,
    text: Colors.textPrimary,
    border: Colors.cardBorder,
    notification: Colors.starlight,
  },
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load API keys from storage and set them in the service modules
        const apiKeys = await getAPIKeys();
        if (apiKeys.openai) {
          setOpenAIKey(apiKeys.openai);
        }
        if (apiKeys.elevenlabs) {
          setElevenLabsKey(apiKeys.elevenlabs);
        }
      } catch (e) {
        console.warn('Error loading API keys:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide splash screen once app is ready
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.lilac} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 500,
            contentStyle: { backgroundColor: Colors.primaryDark },
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="StoryGenerator"
            component={StoryGeneratorScreen}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="StoryReader"
            component={StoryReaderScreen}
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="CharacterGallery"
            component={CharacterGalleryScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="SavedStories"
            component={SavedStoriesScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
