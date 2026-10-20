import { useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView, TextInput, useColorScheme } from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import CalText from '@/components/cal-text';
import CraftStamp from '@/components/craft-stamp';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { useSession } from '@/store/session';
import { formatINR } from '@/lib/rupee';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';

/**
 * Account — §6.5: phone-OTP login (WhatsApp-first, dev console code), order history,
 * sign out. No email/password anywhere — phone hi pehchaan.
 */
export default function AccountScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const cardBg = { backgroundColor: colors.backgroundElement };

  const session = useSession();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const orders = useQuery<{ orders: Order[] }>({
    queryKey: ['orders'],
    queryFn: () => api('/api/account/orders', { token: session.token }),
    enabled: !!session.token,
  });

  const phoneValid = /^\+91\d{10}$/.test(phone);

  const sendOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ ok: boolean; devCode?: number }>('/api/otp/request', {
        method: 'POST',
        body: { phone },
      });
      setSent(true);
      setDevCode(res.devCode ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'OTP nahi gaya');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ token: string }>('/api/otp/verify', {
        method: 'POST',
        body: { phone, code: Number(code) },
      });
      session.setSession(res.token, phone);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'OTP galat — phir try?');
    } finally {
      setBusy(false);
    }
  };

  if (!session.token) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
          <View style={[styles.card, cardBg, styles.loginCard]}>
            <CalText variant="h2" style={styles.loginTitle}>
              Login
            </CalText>
            <CalText variant="bodySmall" color="textSecondary" hindi>
              Sirf phone number. OTP aayega, koi password nahi.
            </CalText>
            <TextInput
              value={phone}
              onChangeText={(t) => setPhone(t.startsWith('+91') ? t : `+91${t.replace(/[^\d]/g, '').slice(-10)}`)}
              keyboardType="phone-pad"
              placeholder="+91XXXXXXXXXX"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { borderColor: colors.backgroundSelected, color: colors.text }]}
            />
            {sent ? (
              <>
                <TextInput
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^\d]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  placeholder="6-digit OTP"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { borderColor: colors.backgroundSelected, color: colors.text }]}
                />
                {devCode ? (
                  <CalText variant="caption" color="textMuted">
                    Dev shortcut (server console me bhi): {devCode}
                  </CalText>
                ) : null}
              </>
            ) : null}
            {error ? (
              <CalText variant="bodySmall" style={{ color: '#B33A2B' }} hindi>
                {error}
              </CalText>
            ) : null}
            <Pressable
              disabled={busy || !(phoneValid && (sent ? code.length === 6 : true))}
              onPress={sent ? verify : sendOtp}
              accessibilityLabel={sent ? 'Verify OTP' : 'Send OTP'}
              style={[styles.cta, busy && { opacity: 0.6 }]}>
              <CalText variant="body" style={styles.ctaText}>
                {busy ? 'Ek second…' : sent ? 'OTP verify karo' : 'OTP bhejo'}
              </CalText>
            </Pressable>
            <CraftStamp />
          </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
        <View style={[styles.card, cardBg]}>
          <CalText variant="h3">Aapke orders</CalText>
          {orders.isLoading ? (
            <CalText variant="bodySmall" color="textMuted">
              Loading…
            </CalText>
          ) : orders.isError ? (
            <CalText variant="bodySmall" color="textMuted">
              Orders nahi mile — API dekh lo.
            </CalText>
          ) : orders.data?.orders.length ? (
            orders.data.orders.map((o) => (
              <Link key={o.id} href={`/order/${o.id}`} asChild>
                <Pressable accessibilityLabel={`Order ${o.id}`} style={styles.orderRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <CalText variant="bodySmall" numberOfLines={1}>
                      {o.items
                        .map((i) => `${i.variant.product.name.replace('Calsio ', '')} ×${i.quantity}`)
                        .join(', ')}
                    </CalText>
                    <CalText variant="caption" color="textMuted">
                      {new Date(o.placedAt).toLocaleDateString('en-IN')} ·{' '}
                      {o.status.toLowerCase().replace(/_/g, ' ')}
                      {o.returnReq ? ` · return ${o.returnReq.status.toLowerCase()}` : ''}
                    </CalText>
                  </View>
                  <CalText variant="bodySmall" style={styles.total}>
                    {formatINR(o.total)}
                  </CalText>
                </Pressable>
              </Link>
            ))
          ) : (
            <CalText variant="bodySmall" color="textSecondary" hindi>
              Abhi tak koi order nahi — pehli pair yahin shuru karein.
            </CalText>
          )}
        </View>

        <Pressable
          accessibilityLabel="Sign out"
          onPress={session.signOut}
          style={[styles.signOut, { borderColor: colors.backgroundSelected }]}>
          <CalText variant="bodySmall" color="textSecondary">
            Sign out
          </CalText>
        </Pressable>
        <CalText variant="caption" color="textMuted" style={styles.footnote}>
          Phone-OTP session · 30 din valid
        </CalText>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.two },
  loginCard: {
    marginTop: Spacing.six,
    marginHorizontal: Spacing.three,
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  loginTitle: { fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cta: { backgroundColor: Palette.clay, borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: '#FFFFFF', fontWeight: '700' },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  total: { fontWeight: '700' },
  signOut: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  footnote: { textAlign: 'center' },
});
