import { useMemo, useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView, TextInput, useColorScheme } from 'react-native';
import { router, Stack } from 'expo-router';

import CalText from '@/components/cal-text';
import { api } from '@/lib/api';
import type { CheckoutResult, Eta } from '@/lib/types';
import { useCart } from '@/store/cart';
import { useSession } from '@/store/session';
import { cartTotals } from '@/lib/cart-math';
import { formatINR } from '@/lib/rupee';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';

/**
 * Checkout — §6.4: address (pincode-validated), OTP at payment step for guests,
 * UPI-first payment (dev-mock until Razorpay test keys land), COD where allowed.
 */
export default function CheckoutScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const cardBg = { backgroundColor: colors.backgroundElement };

  const { items, clear } = useCart();
  const session = useSession();

  const totals = useMemo(
    () => cartTotals(items.map((i) => ({ price: i.price, quantity: i.quantity }))),
    [items]
  );
  const codAvailable = items.length > 0 && items.every((i) => i.isCodEnabled);

  // form fields
  const [phone, setPhone] = useState(session.phone ?? '');
  const [receiver, setReceiver] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state_] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('');
  const [eta, setEta] = useState<Eta | null>(null);
  const [method, setMethod] = useState<'UPI' | 'COD'>('UPI');

  // OTP flow
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const phoneValid = /^\+91\d{10}$/.test(phone);

  const checkEta = async () => {
    try {
      setEta(await api<Eta>(`/api/pincode/eta?pincode=${pincode}`));
    } catch {
      setEta(null);
    }
  };

  const sendOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ ok: boolean; devCode?: number }>('/api/otp/request', {
        method: 'POST',
        body: { phone },
      });
      setOtpSent(true);
      setDevCode(res.devCode ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'OTP nahi gaya');
    } finally {
      setBusy(false);
    }
  };

  const placeOrder = async () => {
    setBusy(true);
    setError(null);
    try {
      // OTP at the payment step (guest → account auto-created)
      let token = session.token;
      if (!token || session.phone !== phone) {
        const verify = await api<{ token: string }>('/api/otp/verify', {
          method: 'POST',
          body: { phone, code: Number(code) },
        });
        session.setSession(verify.token, phone);
        token = verify.token;
      }

      const res = await api<CheckoutResult>('/api/checkout', {
        method: 'POST',
        token,
        body: {
          items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
          method,
          address: { receiver, line1, line2: line2 || undefined, city, state: state_, pincode },
        },
      });
      clear();
      router.replace(`/order/${res.orderId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Order nahi bana. Ek baar phir?');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Checkout' }} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Address */}
          <View style={[styles.card, cardBg]}>
            <CalText variant="h3">Paarcel kahan bhejein?</CalText>
            <Field label="Your name (jise milana hai)" value={receiver} onChange={setReceiver} colors={colors} />
            <Field label="House no / Street" value={line1} onChange={setLine1} colors={colors} />
            <Field label="Landmark (optional)" value={line2} onChange={setLine2} colors={colors} />
            <Field label="City" value={city} onChange={setCity} colors={colors} />
            <View style={styles.rowGap}>
              <Field label="State" value={state_} onChange={() => {}} colors={colors} disabled />
              <View style={{ flex: 1 }}>
                <Field
                  label="Pincode"
                  value={pincode}
                  onChange={(t) => setPincode(t.replace(/[^\d]/g, '').slice(0, 6))}
                  colors={colors}
                />
                {pincode.length === 6 ? (
                  <Pressable onPress={checkEta} accessibilityLabel="Check delivery estimate">
                    <CalText variant="caption" color="link">
                      {eta ? eta.message : 'Delivery estimate check karein'}
                    </CalText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>

          {/* Payment method */}
          <View style={[styles.card, cardBg]}>
            <CalText variant="h3">Payment</CalText>
            <CalText variant="caption" color="textMuted">
              UPI-first India. (Dev mode: UPI mock-paid hai jab tak Razorpay test keys na aayen.)
            </CalText>
            <View style={styles.methodRow}>
              <Pressable
                onPress={() => setMethod('UPI')}
                accessibilityLabel="Pay via UPI"
                style={[
                  [styles.methodBox, { borderColor: colors.backgroundSelected }],
                  method === 'UPI' && { borderColor: Palette.clay, backgroundColor: 'rgba(196,85,45,0.08)' },
                ]}>
                <CalText variant="bodySmall">UPI (GPay/PhonePe/BHIM)</CalText>
                <CalText variant="caption" color="success">
                  Recommended
                </CalText>
              </Pressable>
              <Pressable
                disabled={!codAvailable}
                onPress={() => setMethod('COD')}
                accessibilityLabel="Cash on delivery"
                style={[
                  [styles.methodBox, { borderColor: colors.backgroundSelected }],
                  !codAvailable && { opacity: 0.4 },
                  method === 'COD' && { borderColor: Palette.clay, backgroundColor: 'rgba(196,85,45,0.08)' },
                ]}>
                <CalText variant="bodySmall">COD</CalText>
                <CalText variant="caption" color="textSecondary">
                  {codAvailable ? 'Cash pe paisa' : 'Not available'}
                </CalText>
              </Pressable>
            </View>
          </View>

          {/* OTP at payment step */}
          <View style={[styles.card, cardBg]}>
            <CalText variant="h3">Phone verification (payment step)</CalText>
            <Field
              label="Phone (+91XXXXXXXXXX)"
              value={phone}
              onChange={(t) => setPhone(t.startsWith('+91') ? t : `+91${t.replace(/[^\d]/g, '').slice(-10)}`)}
              colors={colors}
            />
            {otpSent ? (
              <>
                <Field label="6-digit OTP" value={code} onChange={(t) => setCode(t.replace(/[^\d]/g, '').slice(0, 6))} colors={colors} />
                {devCode ? (
                  <CalText variant="caption" color="textMuted">
                    Dev shortcut (console bhi likha): {devCode}
                  </CalText>
                ) : null}
              </>
            ) : null}
            {error ? (
              <CalText variant="bodySmall" style={{ color: '#B33A2B' }} hindi>
                {error}
              </CalText>
            ) : null}
          </View>

          {/* Summary */}
          <View style={[styles.card, cardBg]}>
            <View style={styles.totalRow}>
              <CalText variant="h3">Total</CalText>
              <CalText variant="h3" style={styles.totalValue}>
                {formatINR(totals.total)}
              </CalText>
            </View>
            <Pressable
              disabled={busy || !(phoneValid && receiver && line1 && city && pincode.length === 6 && (!otpSent || code.length === 6))}
              onPress={otpSent ? placeOrder : sendOtp}
              accessibilityLabel={otpSent ? 'Place order' : 'Send OTP'}
              style={[styles.cta, busy && { opacity: 0.6 }]}>
              <CalText variant="body" style={styles.ctaText}>
                {busy ? 'Ek second…' : otpSent ? `Order karo — ${formatINR(totals.total)}` : 'OTP bhejo'}
              </CalText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
  disabled?: boolean;
}) {
  return (
    <View style={styles.field}>
      <CalText variant="caption" color="textSecondary">
        {props.label}
      </CalText>
      <TextInput
        value={props.value}
        onChangeText={props.onChange}
        editable={!props.disabled}
        placeholderTextColor={props.colors.textMuted}
        style={[
          styles.input,
          { borderColor: props.colors.backgroundSelected, color: props.colors.text },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.two },
  card: { borderRadius: Radius.card, padding: Spacing.three, gap: Spacing.two },
  field: { gap: 2 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.stamp,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowGap: { flexDirection: 'row', gap: Spacing.two },
  methodRow: { flexDirection: 'row', gap: Spacing.two },
  methodBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.two,
    gap: 2,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalValue: { fontWeight: '700' },
  cta: { backgroundColor: Palette.clay, borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: '#FFFFFF', fontWeight: '700' },
});
