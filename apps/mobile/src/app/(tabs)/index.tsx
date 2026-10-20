import { StyleSheet, ScrollView, View, Pressable, useColorScheme } from 'react-native';
import { Link, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';

import CalText from '@/components/cal-text';
import CraftStamp from '@/components/craft-stamp';
import { api } from '@/lib/api';
import type { ProductsResponse, ProductListItem } from '@/lib/types';
import { formatINR } from '@/lib/rupee';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';

export const PRODUCT_CATEGORIES = ['SNEAKERS', 'LOAFERS', 'SANDALS', 'FORMAL'] as const;

const CAT_LABELS: Record<string, string> = {
  SNEAKERS: 'Sneakers',
  LOAFERS: 'Loafers',
  SANDALS: 'Sandals',
  FORMAL: 'Formal',
};

/**
 * Home — live data (Phase 2):
 * hero = latest drop card (API) · Snap & Match entry · category rail → PLP ·
 * Agra craft story strip · review wall (verified, seeded).
 */
export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const cardBg = { backgroundColor: colors.backgroundElement };

  const catalog = useQuery<ProductsResponse>({
    queryKey: ['products', 'home'],
    queryFn: () => api<ProductsResponse>('/api/products?pageSize=8&sort=newest'),
  });

  const reviews = useQuery<{ reviews: { id: string; rating: number; text: string }[] }>({
    queryKey: ['reviews', 'home'],
    queryFn: () => api('/api/reviews?limit=3'),
  });

  const hero: ProductListItem | undefined = catalog.data?.items[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
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

      {/* Hero — latest drop (live) */}
      {hero ? (
        <View style={[styles.hero, styles.card, cardBg]}>
          {hero.image?.url ? (
            <Image source={{ uri: hero.image.url }} style={styles.heroImage} contentFit="cover" />
          ) : null}
          <CalText variant="eyebrow" style={styles.heroEyebrow}>
            LATEST DROP
          </CalText>
          <CalText variant="h2" style={styles.heroTitle}>
            {hero.name.replace('Calsio ', '')}
          </CalText>
          <View style={styles.heroPriceRow}>
            <CalText variant="h3" style={styles.heroPrice}>
              {formatINR(hero.price)}
            </CalText>
            <CalText variant="bodySmall" color="textMuted" style={styles.heroMrp}>
              {formatINR(hero.mrp)}
            </CalText>
          </View>
          <Link href={`/product/${hero.slug}`} asChild>
            <Pressable style={styles.heroCta} accessibilityLabel={`View ${hero.name}`}>
              <CalText variant="body" style={styles.heroCtaText}>
                Dekho aur pehno
              </CalText>
            </Pressable>
          </Link>
        </View>
      ) : catalog.isError ? (
        <CalText variant="bodySmall" color="textMuted">
          Catalog backend nahi pahunch raha — `npm run api` chalao.
        </CalText>
      ) : (
        <View style={[styles.card, cardBg, styles.skeleton]}>
          <CalText variant="bodySmall" color="textMuted">
            Storing the drop…
          </CalText>
        </View>
      )}

      {/* Snap & Match — AI entry card */}
      <Pressable
        style={styles.snapCard}
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

      {/* Category rail → PLP */}
      <View style={styles.sectionHead}>
        <CalText variant="h3">Shop by category</CalText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {PRODUCT_CATEGORIES.map((c) => (
          <Link key={c} href={`/collections/${c}`} asChild>
            <Pressable style={styles.chip} accessibilityLabel={`Browse ${CAT_LABELS[c]}`}>
              <CalText variant="body">{CAT_LABELS[c]}</CalText>
            </Pressable>
          </Link>
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

      {/* Review wall (live, verified) */}
      <View style={styles.sectionHead}>
        <CalText variant="h3">What India is saying</CalText>
      </View>
      {(reviews.data?.reviews ?? []).map((r) => (
        <View key={r.id} style={[styles.reviewCard, styles.card, cardBg]}>
          <CalText variant="bodySmall" style={styles.reviewMeta}>
            {'★'.repeat(r.rating)}
            {'☆'.repeat(Math.max(0, 5 - r.rating))} · verified purchase
          </CalText>
          <CalText variant="body" color="textSecondary">
            {r.text}
          </CalText>
        </View>
      ))}

      <CalText variant="caption" color="textMuted" style={styles.footnote}>
        COD · UPI · 7-day easy returns · Free delivery {formatINR(1499)} se upar
      </CalText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  storyCard: { alignItems: 'flex-start' },
  skeleton: { minHeight: 120, justifyContent: 'center' },
  brandRow: { alignItems: 'flex-start', gap: Spacing.one, paddingTop: Spacing.two },
  wordmark: { letterSpacing: 6, fontWeight: '700' },
  hero: { gap: Spacing.two },
  heroImage: { width: '100%', height: 180, borderRadius: Radius.card },
  heroEyebrow: { color: Palette.clay },
  heroTitle: { fontWeight: '700' },
  heroPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  heroPrice: { fontWeight: '700' },
  heroMrp: { textDecorationLine: 'line-through' },
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
  },
  storyTitle: { fontWeight: '700' },
  reviewCard: { gap: Spacing.one },
  reviewMeta: { color: Palette.success },
  footnote: { textAlign: 'center' },
});
