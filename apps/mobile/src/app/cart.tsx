import { StyleSheet, View, Pressable, useColorScheme } from 'react-native';
import { router } from 'expo-router';

import CalText from '@/components/cal-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

/** Cart — Phase 1 empty state. Cart state machine lands in Phase 2 (§6.4). */
export default function CartScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.empty}>
        <CalText variant="h2" style={styles.emoji}>
          👟
        </CalText>
        <CalText variant="h3" style={styles.emptyTitle}>
          Cart khali hai
        </CalText>
        <CalText variant="bodySmall" color="textSecondary" style={styles.emptySub}>
          Ek kadam chhote nahi hote — apni pehli Calsio pair yahan se shuru karein.
        </CalText>
        <Pressable
          accessibilityLabel="Start shopping"
          style={styles.cta}
          onPress={() => router.push('/')}>
          <CalText variant="body" style={styles.ctaText}>
            Shopping shuru karein
          </CalText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four, gap: Spacing.two },
  emoji: { fontSize: 48 },
  emptyTitle: { fontWeight: '700' },
  emptySub: { textAlign: 'center', maxWidth: 280 },
  cta: {
    backgroundColor: '#C4552D',
    borderRadius: Radius.pill,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: Spacing.two,
  },
  ctaText: { color: '#FFFFFF', fontWeight: '600' },
});
