import { StyleSheet, View, useColorScheme } from 'react-native';

import CalText from '@/components/cal-text';
import { Colors, Spacing } from '@/constants/theme';

/**
 * Account — Phase 1 shell. OTP flow + order history wire up in Phase 2 (§6.5).
 */
export default function AccountScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.empty}>
        <CalText variant="h2">CALSIO account</CalText>
        <CalText variant="bodySmall" color="textSecondary" style={styles.sub}>
          Phone OTP se log in karein — orders, returns aur Size Profile sab ek jagah milega.
        </CalText>
        <CalText variant="caption" color="textMuted" style={styles.note}>
          OTP + order tabs Phase 2 me live hote hain.
        </CalText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four, gap: Spacing.two },
  sub: { textAlign: 'center', maxWidth: 280 },
  note: { textAlign: 'center' },
});
