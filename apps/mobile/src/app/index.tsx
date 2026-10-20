import { StyleSheet, ScrollView, View, Pressable, useColorScheme } from 'react-native';
import { router } from 'expo-router';

import CalText from '@/components/cal-text';
import CraftStamp from '@/components/craft-stamp';
import {
  Colors,
  Fonts,
  Palette,
  Radius,
  Spacing,
} from '@/constants/theme';
import { formatINR } from '@/lib/rupee';

/**
 * Home — master prompt §6.1:
 * hero with latest drop · "Snap & Match" AI entry card · category rail ·
 * Agra craft story strip · review wall.
 * Product data is still static in Phase 1; the API wires up in Phase 2.
 */
export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const cardBg = { backgroundColor: colors.backgroundElement };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Wordmark row */}
      <View style={styles.brandRow}>
        <CalText variant="h1" style={styles.wordmark}>
          CALSIO
        </CalText>
        <CalText variant="bodySmall" color="textSecondary">
          {'Agra se. Aapke kadmon tak.'}
        </CalText>
      </View>

      {/* Hero — latest drop */}
      <View style={[styles.hero, styles.card, cardBg]}>
        <CalText variant="eyebrow" style={styles.heroEyebrow}>
          LATEST DROP
        </CalText>
        <CalText variant="h2" style={styles.heroTitle}>
          StepOne Court Sneaker
        </CalText>
        <CalText variant="body" color="textSecondary" style={styles.heroSub}>
          Ivory canvas, memory-foam insole. Hupkai Gali karigari, re-engineered for your 9-to-9.
        </CalText>
        <View style={styles.heroPriceRow}>
          <CalText variant="h3" style={styles.heroPrice}>
            {formatINR(2499)}
          </CalText>
          <CalText variant="bodySmall" color="textMuted" style={styles.heroMrp}>
            {formatINR(3499)}
          </CalText>
        </View>
        <Pressable style={styles.heroCta} accessibilityLabel="Shop the StepOne drop">
          <CalText variant="body" style={styles.heroCtaText}>
            Shop the drop
          </CalText>
        </Pressable>
      </View>

      {/* Snap & Match — AI entry card */}
      <Pressable
        style={[styles.snapCard]}
        accessibilityLabel="Snap and Match: find this shoe in CALSIO"
        onPress={() => router.push('/ai/snap-match')}>
        <View style={styles.snapCopy}>
          <CalText variant="h3" style={styles.snapTitle}>
            ✨ Snap & Match
          </CalText>
          <CalText variant="bodySmall" style={styles.snapSub}>
            Shoe dikhe, Calsio me mil jaayegi. Ek photo maaro — hum nikaal denge.
          </CalText>
        </View>
        <CalText variant="caption" style={styles.aiBadge}>
          AI
        </CalText>
      </Pressable>

      {/* Category rail */}
      <View style={styles.sectionHead}>
        <CalText variant="h3">Shop by category</CalText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {['Sneakers', 'Loafers', 'Sandals', 'Formal'].map((c) => (
          <Pressable key={c} style={styles.chip} accessibilityLabel={`Browse ${c}`}>
            <CalText variant="body">{c}</CalText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Agra craft story strip */}
      <View style={[styles.storyCard, styles.card, cardBg]}>
        <CraftStamp />
        <CalText variant="h3" style={styles.storyTitle}>
          Karigari jo teen pidiyon purani hai
        </CalText>
        <CalText variant="bodySmall" color="textSecondary">
          Hamaare Agra ke kaarigar har pair ko haath se last karte hain — wahi craft jo duniya ke
          mozey-baazaron ko pasand aata hai, ab seedha factory se aapke ghar. Bich me koi dalal
          nahi, isliye daam sachche.
        </CalText>
      </View>

      {/* Review wall */}
      <View style={styles.sectionHead}>
        <CalText variant="h3">What India is saying</CalText>
      </View>
      {REVIEWS.map((r) => (
        <View key={r.name} style={[styles.reviewCard, styles.card, cardBg]}>
          <CalText variant="bodySmall" style={styles.reviewMeta}>
            ★★★★★ · {r.name} · {r.city} · verified purchase
          </CalText>
          <CalText variant="body" color="textSecondary">
            {r.text}
          </CalText>
        </View>
      ))}

      <CalText variant="caption" color="textMuted" style={styles.footnote}>
        Product surfaces connect to live catalog in Phase 2.
      </CalText>
    </ScrollView>
  );
}

const REVIEWS = [
  {
    name: 'Priya S.',
    city: 'Lucknow',
    text: 'StepOne 10 din se roz pehna hai — alte pehnne se bhi pair me dard nahi. Packaging dekh ke maa khush ho gayi!',
  },
  {
    name: 'Rohit K.',
    city: 'Jaipur',
    text: 'Size Oracle ne bilkul sahi size bataya. Peli baar online joote order kiye, return ki tension khatam.',
  },
  {
    name: 'Faisal A.',
    city: 'Hyderabad',
    text: 'Tan loafer shaadi me pehna. Log "kahan se liya?" puch rahe the. Franchise wale brand me milta hi nahi itni finishing.',
  },
] as const;

const styles = StyleSheet.create({
  screen: { flex: 1 },  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  brandRow: {
    alignItems: 'flex-start',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  wordmark: {
    letterSpacing: 6,
    fontWeight: '700',
  },
  hero: {
    gap: Spacing.two,
  },
  heroEyebrow: {
    color: Palette.clay,
  },
  heroTitle: {
    fontWeight: '700',
  },
  heroSub: { fontFamily: Fonts.body },
  heroPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  heroPrice: {
    fontWeight: '700',
  },
  heroMrp: {
    textDecorationLine: 'line-through',
  },
  heroCta: {
    backgroundColor: Palette.clay,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  heroCtaText: { color: '#FFFFFF', fontWeight: '600' },
  snapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.charcoal,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  snapCopy: { flex: 1, gap: 2 },
  snapTitle: { color: Palette.ivory },
  snapSub: { color: 'rgba(247, 241, 232, 0.75)' },
  aiBadge: {
    color: Palette.charcoal,
    backgroundColor: Palette.ivory,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '700',
  },
  sectionHead: { marginTop: Spacing.two },
  rail: { gap: Spacing.two, paddingVertical: Spacing.one },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.clay,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  storyTitle: { fontWeight: '700' },
  storyCard: { gap: Spacing.two },
  reviewCard: { gap: Spacing.one },
  reviewMeta: { color: Palette.success },
  footnote: { textAlign: 'center' },
});
