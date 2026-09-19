import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Clock, MapPin, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { Button, cardStyle, radii, spacing, Text, useTheme } from '@ub/ui';
import { useLocationStore } from '../lib/store/locationStore';

export default function OrderSuccessScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId?: string;
    bookingCode?: string;
    paymentMethod?: string;
    grandTotal?: string;
  }>();

  const selectedAddress = useLocationStore((s) => s.address);

  const isOnline = params.paymentMethod === 'ONLINE';
  const bookingCode = params.bookingCode || 'BK-SUCCESS';
  const grandTotal = params.grandTotal || '0';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <CheckCircle2 size={54} color="#16a34a" strokeWidth={2.5} />
        </View>

        <Text variant="heading" fontWeight="800" style={styles.title}>
          Booking Placed!
        </Text>
        <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
          Your service booking has been confirmed and is now broadcasting to nearby certified
          caregivers.
        </Text>

        {/* Order Details Card */}
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkMuted }]}>Booking Reference</Text>
            <Text fontWeight="800" style={[styles.detailValue, { color: colors.primary }]}>
              {bookingCode}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkMuted }]}>Payment Mode</Text>
            <View style={[styles.badge, { backgroundColor: isOnline ? '#dcfce7' : '#fef3c7' }]}>
              <Text
                fontWeight="700"
                style={[styles.badgeText, { color: isOnline ? '#166534' : '#92400e' }]}
              >
                {isOnline ? 'PAID ONLINE (Razorpay)' : 'CASH ON DELIVERY (Pending)'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkMuted }]}>Amount</Text>
            <Text variant="heading" fontWeight="800" style={styles.amountValue}>
              ₹{Number(grandTotal).toFixed(0)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Status Row */}
          <View style={styles.statusRow}>
            <Clock size={16} color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.ink }]}>
              Status: <Text fontWeight="700">Broadcasting to candidate crew</Text>
            </Text>
          </View>

          {/* Address Row */}
          {selectedAddress ? (
            <View style={styles.statusRow}>
              <MapPin size={16} color={colors.primary} />
              <Text numberOfLines={2} style={[styles.statusText, { color: colors.inkMuted }]}>
                {selectedAddress.formattedAddress}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Trust info */}
        <View style={styles.trustBox}>
          <ShieldCheck size={20} color={colors.primary} />
          <Text style={[styles.trustText, { color: colors.inkMuted }]}>
            A verified UrbanCrew health caregiver will be assigned shortly. You will receive an SMS
            and push alert with their profile.
          </Text>
        </View>
      </View>

      {/* Action Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <Button
          label="Track Booking Status"
          onPress={() => router.replace('/(tabs)/bookings')}
          fullWidth
        />
        <Button
          label="Back to Home"
          variant="secondary"
          onPress={() => router.replace('/(tabs)')}
          fullWidth
          style={{ marginTop: spacing.xs }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  card: {
    width: '100%',
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 15,
  },
  amountValue: {
    fontSize: 18,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 11,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    flex: 1,
  },
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  trustText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
});
