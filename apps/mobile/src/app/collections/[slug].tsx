import { useState } from 'react';
import { StyleSheet, FlatList, View, Pressable, TextInput, useColorScheme } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';

import CalText from '@/components/cal-text';
import CraftStamp from '@/components/craft-stamp';
import { api } from '@/lib/api';
import type { ProductsResponse } from '@/lib/types';
import { formatINR } from '@/lib/rupee';
import { Colors, Radius, Spacing } from '@/constants/theme';

const CATEGORY_LABELS: Record<string, string> = {
  SNEAKERS: 'Sneakers',
  LOAFERS: 'Loafers',
  SANDALS: 'Sandals',
  FORMAL: 'Formal',
  all: 'All shoes',
};

/** PLP — /collections/[slug] (§6.2): sort + price filters, live catalog. */
export default function CollectionScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const cardBg = { backgroundColor: colors.backgroundElement };

  const params = useLocalSearchParams<{ slug: string }>();
  const category = params.slug && params.slug !== 'all' ? params.slug.toUpperCase() : 'all';

  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const query = useQuery<ProductsResponse>({
    queryKey: ['products', category, sort, minPrice, maxPrice],
    queryFn: () =>
      api<ProductsResponse>(
        `/api/products?pageSize=24&category=${encodeURIComponent(category)}` +
          `&sort=${sort}` +
          (minPrice ? `&minPrice=${minPrice}` : '') +
          (maxPrice ? `&maxPrice=${maxPrice}` : '')
      ),
  });

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <CalText variant="h2" style={styles.title}>
            {CATEGORY_LABELS[category] ?? 'Collection'}
          </CalText>
          <View style={styles.sortOptions}>
            {(['newest', 'price-asc', 'price-desc'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setSort(s)}
                accessibilityLabel={`Sort by ${s}`}
                style={[
                  [styles.sortOption, { backgroundColor: colors.backgroundElement }],
                  sort === s && { backgroundColor: colors.primary },
                ]}>
                <CalText
                  variant="caption"
                  style={{ color: sort === s ? '#FFFFFF' : colors.text }}>
                  {s === 'newest' ? 'Latest' : s === 'price-asc' ? '₹ Low→High' : '₹ High→Low'}
                </CalText>
              </Pressable>
            ))}
          </View>
          <View style={styles.priceRow}>
            <TextInput
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="number-pad"
              placeholder="min ₹"
              placeholderTextColor={colors.textMuted}
              style={[styles.priceInput, { borderColor: colors.backgroundSelected, color: colors.text }]}
            />
            <TextInput
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="number-pad"
              placeholder="max ₹"
              placeholderTextColor={colors.textMuted}
              style={[styles.priceInput, { borderColor: colors.backgroundSelected, color: colors.text }]}
            />
          </View>
          <CalText variant="bodySmall" color="textMuted">
            {query.data ? `${query.data.total} products · 7-day returns sans skip` : ''}
          </CalText>
        </View>
      }
      data={query.data?.items ?? []}
      keyExtractor={(i) => i.id}
      numColumns={2}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
      renderItem={({ item }) => (
        <Link href={`/product/${item.slug}`} asChild>
          <Pressable
            accessibilityLabel={`View ${item.name}`}
            style={[styles.card, cardBg]}>
            {item.image?.url ? (
              <Image source={{ uri: item.image.url }} style={styles.cardImage} contentFit="cover" />
            ) : null}
            <CalText variant="bodySmall" style={styles.cardName} numberOfLines={2}>
              {item.name.replace('Calsio ', '')}
            </CalText>
            <View style={styles.cardMeta}>
              <CalText variant="bodySmall" style={styles.cardPrice}>
                {formatINR(item.price)}
              </CalText>
              <CalText variant="caption" color="textMuted" style={styles.cardMrp}>
                {formatINR(item.mrp)}
              </CalText>
            </View>
            <View style={styles.stamps}>
              <CraftStamp />
              {item.ratingAvg ? (
                <CraftStamp label={`★ ${item.ratingAvg} (${item.reviewCount})`} />
              ) : null}
            </View>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.three, paddingBottom: Spacing.six },
  header: { gap: Spacing.two, paddingBottom: Spacing.two },
  title: { fontWeight: '700' },
  sortOptions: { flexDirection: 'row', gap: Spacing.two },
  sortOption: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceRow: { flexDirection: 'row', gap: Spacing.two },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  card: {
    flex: 1,
    margin: 2,
    borderRadius: Radius.card,
    padding: 10,
    gap: Spacing.one,
  },
  cardImage: { width: '100%', height: 140, borderRadius: Radius.card - 4 },
  cardName: { minHeight: 34 },
  cardMeta: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  cardPrice: { fontWeight: '700' },
  cardMrp: { textDecorationLine: 'line-through' },
  stamps: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
});
