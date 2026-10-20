import { useMemo, useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, TextInput, useColorScheme } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';

import CalText from '@/components/cal-text';
import CraftStamp from '@/components/craft-stamp';
import { api } from '@/lib/api';
import type { PdpProduct, Eta } from '@/lib/types';
import { formatINR } from '@/lib/rupee';
import { useCart } from '@/store/cart';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';

/**
 * PDP — /product/[slug] (§6.3):
 * gallery · size grid with AI size-check badge (stub until Phase 3) · live stock ·
 * ₹ + UPI/COD badges · pincode ETA checker · verified reviews · add to cart.
 */
export default function ProductScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const cardBg = { backgroundColor: colors.backgroundElement };

  const params = useLocalSearchParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const addToCart = useCart((s) => s.add);

  const pdp = useQuery<{ product: PdpProduct }>({
    queryKey: ['product', slug],
    queryFn: () => api(`/api/products/${slug}`),
  });
  const product = pdp.data?.product;

  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [eta, setEta] = useState<Eta | null>(null);
  const [imgIndex, setImgIndex] = useState(0);

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.sku === selectedSku) ?? null,
    [product, selectedSku]
  );

  const checkEta = async () => {
    try {
      setEta(await api<Eta>(`/api/pincode/eta?pincode=${pin}`));
    } catch {
      setEta(null);
    }
  };

  const handleAdd = () => {
    if (!product || !selectedVariant) return;
    addToCart({
      sku: selectedVariant.sku,
      productSlug: product.slug,
      name: product.name,
      size: selectedVariant.size,
      colorName: selectedVariant.colorName,
      price: product.price,
      mrp: product.mrp,
      image: product.images[0]?.url ?? null,
      isCodEnabled: product.isCodEnabled,
    });
    router.push('/cart');
  };

  return (
    <>
      <Stack.Screen options={{ title: product ? product.name.replace('Calsio ', '') : 'Loading…' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {product ? (
          <>
            {/* Gallery */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) =>
                setImgIndex(Math.round(e.nativeEvent.contentOffset.x / 358))
              }
              scrollEventThrottle={64}>
              {product.images.map((img) => (
                <Image
                  key={img.url}
                  source={{ uri: img.url }}
                  style={styles.galleryImage}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
            <View style={styles.dots}>
              {product.images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === imgIndex ? Palette.clay : colors.backgroundSelected },
                  ]}
                />
              ))}
            </View>

            {/* Title + price */}
            <CalText variant="h2" style={styles.title}>
              {product.name.replace('Calsio ', '')}
            </CalText>
            <View style={styles.priceRow}>
              <CalText variant="h1" style={styles.price}>
                {formatINR(product.price)}
              </CalText>
              <CalText variant="body" color="textMuted" style={styles.mrp}>
                {formatINR(product.mrp)}
              </CalText>
              <CalText variant="bodySmall" color="link">
                Save {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
              </CalText>
            </View>
            <View style={styles.badgeRow}>
              <CraftStamp label="UPI" />
              <CraftStamp label={product.isCodEnabled ? 'COD available' : 'Prepaid only'} />
            </View>

            {/* Size grid */}
            <CalText variant="h3" style={styles.sectionHead}>
              Select size {selectedSku ? `· ${selectedVariant?.size}` : ''}
            </CalText>
            <CalText variant="caption" color="link">
              ✓ AI size check ready — Size Oracle lands in Phase 3
            </CalText>
            <View style={styles.sizeGrid}>
              {product.variants.map((v) => {
                const soldOut = v.stock <= 0;
                const active = v.sku === selectedSku;
                return (
                  <Pressable
                    key={v.sku}
                    disabled={soldOut}
                    onPress={() => setSelectedSku(v.sku)}
                    accessibilityLabel={`Size ${v.size}, ${soldOut ? 'sold out' : `${v.stock} in stock`}`}
                    style={[
                      styles.sizeBox,
                      { borderColor: colors.backgroundSelected },
                      active && { borderColor: Palette.clay, backgroundColor: 'rgba(196, 85, 45, 0.08)' },
                    ]}>
                    <CalText variant="body" style={[soldOut && { color: colors.textMuted }]}>
                      {v.size.replace('UK ', '')}
                    </CalText>
                    <CalText
                      variant="caption"
                      style={{ color: soldOut ? colors.textMuted : Palette.success }}
                      hindi>
                      {soldOut ? 'खत्म' : `${v.stock} बचे`}
                    </CalText>
                  </Pressable>
                );
              })}
            </View>

            {/* Pincode ETA */}
            <View style={[styles.card, cardBg]}>
              <CalText variant="h3">Kahan tak bhejein?</CalText>
              <View style={styles.etaRow}>
                <TextInput
                  value={pin}
                  onChangeText={(t) => setPin(t.replace(/[^\d]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  placeholder="Pincode (e.g. 282001)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.etaInput, { borderColor: colors.backgroundSelected, color: colors.text }]}
                />
                <Pressable
                  style={[styles.etaBtn, pin.length !== 6 && { opacity: 0.5 }]}
                  disabled={pin.length !== 6}
                  accessibilityLabel="Check delivery estimate"
                  onPress={checkEta}>
                  <CalText variant="bodySmall" style={styles.etaBtnText} hindi>
                    जाँचें
                  </CalText>
                </Pressable>
              </View>
              {eta ? (
                <CalText variant="bodySmall" color="success">
                  {eta.message}
                  {eta.codAvailable ? ' · COD available' : ' · Prepaid only here'}
                </CalText>
              ) : pin.length === 6 && !eta ? (
                <CalText variant="bodySmall" color="textMuted">
                  Pincode check failed — API running hai na?
                </CalText>
              ) : null}
            </View>

            {/* Description */}
            <View style={[styles.card, cardBg]}>
              <CalText variant="body" color="textSecondary">
                {product.description}
              </CalText>
              {product.descriptionHi ? (
                <CalText variant="body" hindi color="textSecondary">
                  {product.descriptionHi}
                </CalText>
              ) : null}
              <CraftStamp />
              <CalText variant="bodySmall" color="textMuted">
                {product.craftStory}
              </CalText>
              {product.material ? (
                <CalText variant="caption" color="textMuted">
                  {product.material}
                </CalText>
              ) : null}
            </View>

            {/* Reviews */}
            {product.reviews.length > 0 ? (
              <View style={[styles.card, cardBg]}>
                <CalText variant="h3">Verified reviews</CalText>
                {product.reviews.map((r) => (
                  <View key={r.id} style={styles.review}>
                    <CalText variant="caption" style={{ color: Palette.success }}>
                      {'★'.repeat(r.rating)} · {r.customer.name ?? 'Verified buyer'}
                    </CalText>
                    <CalText variant="bodySmall" color="textSecondary">
                      {r.text}
                    </CalText>
                  </View>
                ))}
              </View>
            ) : null}

            <CalText variant="caption" color="textMuted" style={styles.promise}>
              7-day easy returns · Free delivery {formatINR(1499)}+ · Crafted in Agra
            </CalText>
          </>
        ) : (
          <View style={[styles.card, cardBg, styles.skeleton]}>
            <CalText variant="bodySmall" color="textMuted">
              {pdp.isError ? 'Product not found / API asleep' : 'Loading…'}
            </CalText>
          </View>
        )}
      </ScrollView>

      {/* Sticky add-to-cart */}
      <View style={[styles.ctaBar, { backgroundColor: colors.background }]}>
        <Pressable
          disabled={!selectedVariant}
          onPress={handleAdd}
          accessibilityLabel="Add to cart"
          style={[styles.cta, !selectedVariant && { opacity: 0.5 }]}>
          <CalText variant="body" style={styles.ctaText}>
            Add to cart{selectedVariant ? ` — ${formatINR(product!.price)}` : ''}
          </CalText>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, paddingBottom: Spacing.six + 72, gap: Spacing.two },
  galleryImage: { width: 358, height: 280, borderRadius: Radius.card },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  title: { fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  price: { fontWeight: '700' },
  mrp: { textDecorationLine: 'line-through' },
  badgeRow: { flexDirection: 'row', gap: Spacing.two },
  sectionHead: { marginTop: Spacing.one, fontWeight: '700' },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  sizeBox: {
    borderWidth: 1,
    borderRadius: Radius.card,
    minWidth: 64,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  etaRow: { flexDirection: 'row', gap: Spacing.two },
  etaInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  etaBtn: {
    backgroundColor: Palette.clay,
    borderRadius: Radius.card,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  etaBtnText: { color: '#FFFFFF' },
  review: { gap: 2 },
  promise: { textAlign: 'center' },
  skeleton: { minHeight: 160, justifyContent: 'center' },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.three,
  },
  cta: {
    backgroundColor: Palette.clay,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: '#FFFFFF', fontWeight: '700' },
});
