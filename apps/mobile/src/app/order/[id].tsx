import { StyleSheet, View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { Link, useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import CalText from '@/components/cal-text';
import CraftStamp from '@/components/craft-stamp';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatINR } from '@/lib/rupee';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';

const TIMELINE: Order['status'][] = [
  'PLACED',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const STATUS_COPY: Record<Order['status'], string> = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed in Agra',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

/** Order tracking — §6.5 timeline; live status from the API. */
export default function OrderScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const cardBg = { backgroundColor: colors.backgroundElement };

  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id ?? '';

  const query = useQuery<{ order: Order }>({
    queryKey: ['order', id],
    queryFn: () => api(`/api/orders/${id}`),
  });
  const order = query.data?.order;

  const stepIndex = order ? TIMELINE.indexOf(order.status) : -1;

  return (
    <>
      <Stack.Screen options={{ title: 'Order' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {order ? (
          <>
            <View style={[styles.card, cardBg]}>
              <CalText variant="caption" color="textMuted">
                Order #{order.id.slice(-8).toUpperCase()}
              </CalText>
              <CalText variant="h2" style={styles.state}>
                {STATUS_COPY[order.status]}
              </CalText>
              <CalText variant="bodySmall" color="link">
                Agra se. Aapke kadmon tak.
              </CalText>

              {order.status === 'CANCELLED' ? (
                <CalText variant="bodySmall" style={{ color: '#B33A2B' }}>
                  Ye order cancel ho gaya. Paisa wapas 5-7 din me aayega.
                </CalText>
              ) : (
                <View style={styles.timeline}>
                  {TIMELINE.map((s, i) => (
                    <View key={s} style={styles.step}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: i <= stepIndex ? Palette.clay : colors.backgroundSelected },
                        ]}
                      />
                      <CalText
                        variant="bodySmall"
                        style={{ color: i <= stepIndex ? colors.text : colors.textMuted }}>
                        {STATUS_COPY[s]}
                      </CalText>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.card, cardBg]}>
              <CalText variant="h3">Items</CalText>
              {order.items.map((it) => (
                <View key={it.variant.sku} style={styles.itemRow}>
                  <CalText variant="bodySmall" style={{ flex: 1 }}>
                    {it.variant.product.name.replace('Calsio ', '')} · {it.variant.size} ×{' '}
                    {it.quantity}
                  </CalText>
                  <CalText variant="bodySmall">{formatINR(it.unitPrice * it.quantity)}</CalText>
                </View>
              ))}
              <View style={[styles.itemRow, styles.totalLine]}>
                <CalText variant="body" color="textSecondary">
                  Delivery
                </CalText>
                <CalText variant="bodySmall">
                  {order.shippingFee === 0 ? 'FREE' : formatINR(order.shippingFee)}
                </CalText>
              </View>
              <View style={[styles.itemRow, styles.totalLine]}>
                <CalText variant="h3">Total</CalText>
                <CalText variant="h3" style={styles.total}>
                  {formatINR(order.total)}
                </CalText>
              </View>
              {order.payment ? (
                <CalText variant="caption" color="textMuted">
                  {order.payment.method === 'COD'
                    ? 'COD — cash on delivery'
                    : 'UPI — paid'}{' '}
                  · {order.payment.status.toLowerCase()}
                </CalText>
              ) : null}
            </View>

            {/* 7-day return promise (§1.2) — return start ships in Phase 2.1 */}
            <View style={[styles.card, cardBg]}>
              <CalText variant="h3">7-din, no drama returns</CalText>
              <CalText variant="bodySmall" color="textSecondary">
                Delivery ke 7 din ke andar return request karein — pickup hamare side se.{" "}
                {order.returnReq ? `(Return status: ${order.returnReq.status})` : ''}
              </CalText>
            </View>

            <Link href="/account" asChild>
              <Pressable accessibilityLabel="View all orders">
                <CalText variant="bodySmall" color="link" style={styles.link}>
                  Saare orders dekho →
                </CalText>
              </Pressable>
            </Link>
            <CraftStamp />
          </>
        ) : (
          <View style={[styles.card, cardBg, styles.skeleton]}>
            <CalText variant="bodySmall" color="textMuted">
              {query.isError ? 'Order nahi mila (login chahiye)' : 'Loading…'}
            </CalText>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.two },
  card: { borderRadius: Radius.card, padding: Spacing.three, gap: Spacing.two },
  state: { fontWeight: '700' },
  timeline: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  step: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  totalLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(26,22,18,0.12)', paddingTop: 6 },
  total: { fontWeight: '700' },
  link: { textAlign: 'center' },
  skeleton: { minHeight: 150, justifyContent: 'center' },
});
