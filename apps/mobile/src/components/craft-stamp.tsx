import { StyleSheet, View } from 'react-native';

import CalText from './cal-text';
import { Palette, Radius } from '@/constants/theme';

/**
 * "Crafted in Agra" stamp — required on every product card (§5).
 * Small tactile kraft-stamp look.
 */
export default function CraftStamp({ label = 'Crafted in Agra' }: { label?: string }) {
  return (
    <View style={styles.stamp}>
      <View style={styles.dot} />
      <CalText variant="caption" style={styles.text}>
        {label}
      </CalText>
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.stamp,
    borderWidth: 1,
    borderColor: Palette.clay,
    backgroundColor: 'rgba(196, 85, 45, 0.08)',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.clay,
  },
  text: {
    color: Palette.clay,
  },
});
