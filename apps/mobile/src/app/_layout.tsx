import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_600SemiBold,
} from '@expo-google-fonts/noto-sans-devanagari';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

import { Colors } from '@/constants/theme';
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      })
  );

  const theme = useMemo(
    () => ({
      ...(dark ? DarkTheme : DefaultTheme),
      colors: {
        ...(dark ? DarkTheme : DefaultTheme).colors,
        primary: Colors[dark ? 'dark' : 'light'].primary,
        background: Colors[dark ? 'dark' : 'light'].background,
        card: Colors[dark ? 'dark' : 'light'].backgroundElement,
        text: Colors[dark ? 'dark' : 'light'].text,
        border: Colors[dark ? 'dark' : 'light'].backgroundSelected,
        notification: Colors[dark ? 'dark' : 'light'].primary,
      },
    }),
    [dark]
  );

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        {/* Root stack: tabs group + every pushed shop route (PDP/PLP/checkout/order/ai). */}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
