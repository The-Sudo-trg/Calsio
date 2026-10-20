import { StyleSheet, ScrollView, View, TextInput, useColorScheme } from 'react-native';

import CalText from '@/components/cal-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

/**
 * Search — Phase 1 shell. Recent/trending chips + search input.
 * Live catalog results wire to calsio-catalog-mcp in Phase 2/3 (§8).
 */
export default function SearchScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <CalText variant="h2" style={styles.title}>
        Dhoondo
      </CalText>
      <TextInput
        accessibilityLabel="Search CALSIO shoes"
        placeholder="Sneakers, loafers, size…"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.backgroundSelected },
        ]}
      />

      <CalText variant="h3" style={styles.sectionHead}>
        Trending abhi
      </CalText>
      <View style={styles.chipRow}>
        {['white sneakers', 'shaadi loafers', 'college slips', 'office formal'].map((t) => (
          <View key={t} style={[styles.chip, { borderColor: colors.primary }]}>
            <CalText variant="bodySmall">{t}</CalText>
          </View>
        ))}
      </View>

      <CalText variant="bodySmall" color="textMuted" style={styles.note}>
        Live catalog search connects to the API in Phase 2 — filters, sizes aur pricing sab aayega.
      </CalText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  title: { fontWeight: '700' },
  input: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHead: { marginTop: Spacing.one, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  note: { marginTop: Spacing.two },
});
