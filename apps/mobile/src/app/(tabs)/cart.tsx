import { StyleSheet, View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { Link, router } from 'expo-router';
import { Image } from 'expo-image';

import CalText from '@/components/cal-text';
import { useCart } from '@/store/cart';
import { cartTotals } from '@/lib/cart-math';
import { formatINR } from '@/lib/rupee';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';

/** Cart — §6.4 local cart surface; server re-validates every line at checkout. */
export default function CartScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const cardBg = { backgroundColor: colors.backgroundElement };

  const { items, setQuantity, remove } = useCart();
  const totals = cartTotals(items.map((i) => ({ price: i.price, quantity: i.quantity })));

  if (items.length === 0) {
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
              Ek kadam chhota nahi hota — apni pehli Calsio pair yahan se shuru karein.
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {items.map((i) => (
            <View key={i.sku} style={[styles.line, cardBg]}>
              {i.image ? (
                <Image source={{ uri: i.image }} style={styles.lineImage} contentFit="cover" />
              ) : null}
              <View style={styles.lineBody}>
                <CalText variant="bodySmall" numberOfLines={2}>
                  {i.name.replace('Calsio ', '')} · {i.size}
                </CalText>
                <CalText variant="caption" color="textSecondary">
                  {i.colorName} · {formatINR(i.price)}
                </CalText>
                <View style={styles.qtyRow}>
                  <Pressable
                    accessibilityLabel={`Decrease quantity of ${i.name}`}
                    style={[styles.qtyBtn, { borderColor: colors.backgroundSelected }]}
                    onPress={() => setQuantity(i.sku, i.quantity - 1)}>
                    <CalText variant="body">−</CalText>
                  </Pressable>
                  <CalText variant="bodySmall">{i.quantity}</CalText>
                  <Pressable
                    accessibilityLabel={`Increase quantity of ${i.name}`}
                    style={[styles.qtyBtn, { borderColor: colors.backgroundSelected }]}
                    onPress={() => setQuantity(i.sku, i.quantity + 1)}>
                    <CalText variant="body">+</CalText>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Remove ${i.name} from cart`}
                    onPress={() => remove(i.sku)}>
                    <CalText variant="caption" color="textMuted">
                      Hatao
                    </CalText>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

          {/* Free-shipping nudge */}
          <View style={[styles.totalsCard, cardBg]}>
            <CalText variant="body" color={totals.freeShippingUnlocked ? 'success' : 'textSecondary'} hindi={false}>
              {totals.freeShippingUnlocked
                ? `Free shipping unlocked! Aapke pair alag chaap maarenge.`
                : `Free shipping ke liye sirf ${formatINR(totals.freeShippingRemaining)} baaki`}
            </CalText>
            <View style={styles.totalRow}>
              <CalText variant="body" color="textSecondary">
                Subtotal
              </CalText>
              <CalText variant="body">{formatINR(totals.subtotal)}</CalText>
            </View>
            <View style={styles.totalRow}>
              <CalText variant="body" color="textSecondary">
                Delivery
              </CalText>
              <CalText variant="body">
                {totals.shippingFee === 0 ? 'FREE' : formatINR(totals.shippingFee)}
              </CalText>
            </View>
            <View style={styles.totalRow}>
              <CalText variant="h3">Total</CalText>
              <CalText variant="h3" style={styles.totalValue}>
                {formatINR(totals.total)}
              </CalText>
            </View>
          </View>
          <CalText variant="caption" color="textMuted" style={styles.note}>
            UPI first hamesha. COD bhi diya jaata hai (product-dependent).
          </CalText>
        </ScrollView>

        <View style={styles.ctaBar}>
          <Link href="/checkout" asChild>
            <Pressable accessibilityLabel="Proceed to checkout" style={styles.cta}>
              <CalText variant="body" style={styles.ctaText}>
                Checkout · {formatINR(totals.total)}
              </CalText>
            </Pressable>
          </Link>
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
  content: { padding: Spacing.three, paddingBottom: Spacing.six + 88, gap: Spacing.two },
  line: {
    flexDirection: 'row',
    borderRadius: Radius.card,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  lineImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: Palette.ivory },
  lineBody: { flex: 1, gap: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: 4 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalsCard: { borderRadius: Radius.card, padding: Spacing.three, gap: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalValue: { fontWeight: '700' },
  note: { textAlign: 'center' },
  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.three },
  cta: {
    backgroundColor: Palette.clay,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: '#FFFFFF', fontWeight: '700' },
});
