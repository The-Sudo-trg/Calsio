import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 * Implemented with useSyncExternalStore (no render-loop-y effects):
 * - server snapshot: false (static render assumes light)
 * - client snapshot: true (browser is always hydrated by the time it renders)
 */
const neverSubscribe = () => () => {};

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    neverSubscribe,
    () => true,
    () => false
  );

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
