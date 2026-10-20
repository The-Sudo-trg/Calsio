import { StyleSheet, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';

import CalText from '@/components/cal-text';
import { Colors, Spacing } from '@/constants/theme';
/**
 * Snap & Match (§7-A) — Phase 1 route stub so the Home AI card navigates cleanly.
 * Upload → vision provider → top-5 matches lands in Phase 3.
 */
export default function SnapMatchScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.empty}>
        <CalText variant="h2" style={styles.emoji}>
          📸
        </CalText>
        <CalText variant="h3" style={styles.title}>
          AI camera yahan aayega
        </CalText>
        <CalText variant="bodySmall" color="textSecondary" style={styles.sub}>
          Kisi bhi jootey ki photo maaro — vision model sabse nazdeek ke 5 Calsio products dikhayega,
          match % ke saath. Phase 3 me live.
        </CalText>
        <CalText
          accessibilityRole="button"
          variant="bodySmall"
          color="link"
          onPress={() => router.back()}>
          ← Back home
        </CalText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four, gap: Spacing.two },
  emoji: { fontSize: 44 },
  title: { fontWeight: '700' },
  sub: { textAlign: 'center', maxWidth: 300 },
});
