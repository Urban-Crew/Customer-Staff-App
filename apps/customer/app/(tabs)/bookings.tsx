import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  UserCheck,
  ChevronRight,
} from 'lucide-react-native';
import { Button, cardStyle, radii, spacing, Text, useTheme } from '@ub/ui';
import { useMyBookings } from '../../hooks/useBookings';
import type { BookingDetails } from '../../services/booking.service';

export default function BookingsScreen() {
  const { colors } = useTheme();
  const { data: bookings, isLoading, refetch, isRefetching } = useMyBookings();

  const getStatusConfig = (state: string) => {
    switch (state) {
      case 'PENDING_PAYMENT':
        return { label: 'Payment Pending', bg: '#fef3c7', text: '#92400e' };
      case 'BROADCASTING':
        return { label: 'Finding Caregiver...', bg: '#e0f2fe', text: '#0369a1' };
      case 'ASSIGNED':
        return { label: 'Caregiver Assigned', bg: '#dcfce7', text: '#15803d' };
      case 'ARRIVED':
        return { label: 'At Doorstep', bg: '#ccfbf1', text: '#0f766e' };
      case 'ACTIVE':
        return { label: 'Care in Progress', bg: '#e0e7ff', text: '#4338ca' };
      case 'COMPLETED':
        return { label: 'Completed', bg: '#f1f5f9', text: '#475569' };
      case 'CANCELLED':
        return { label: 'Cancelled', bg: '#fee2e2', text: '#b91c1c' };
      default:
        return { label: state, bg: '#f1f5f9', text: '#475569' };
    }
  };

  const renderBookingItem = ({ item }: { item: BookingDetails }) => {
    const statusConfig = getStatusConfig(item.state);
    const isPaid = item.paymentStatus === 'PAID';
    const isCod = item.paymentMethod === 'COD';

    return (
      <View
        style={[
          styles.bookingCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text fontWeight="800" style={[styles.bookingCode, { color: colors.primary }]}>
              {item.bookingCode || item.id.substring(0, 10)}
            </Text>
            {item.createdAt ? (
              <Text style={[styles.bookingDate, { color: colors.inkMuted }]}>
                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            ) : null}
          </View>

          <View style={[styles.statusPill, { backgroundColor: statusConfig.bg }]}>
            <Text fontWeight="700" style={[styles.statusText, { color: statusConfig.text }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Service Items */}
        <View style={[styles.serviceSection, { borderTopColor: colors.surfaceSubtle }]}>
          {item.items && item.items.length > 0 ? (
            item.items.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text fontWeight="700" style={styles.serviceName}>
                    {it.serviceNameSnapshot}
                  </Text>
                  <Text style={[styles.variantName, { color: colors.inkMuted }]}>
                    {it.variantNameSnapshot} (x{it.quantity})
                  </Text>
                </View>
                <Text fontWeight="700" style={styles.lineTotal}>
                  ₹{Number(it.lineTotalMinor).toFixed(0)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.itemRow}>
              <Text fontWeight="700" style={styles.serviceName}>
                Care Service Booking
              </Text>
              <Text fontWeight="700" style={styles.lineTotal}>
                ₹{item.grandTotal ? item.grandTotal.toFixed(0) : '—'}
              </Text>
            </View>
          )}
        </View>

        {/* Assigned Crew Details */}
        {item.assignedCrew ? (
          <View style={[styles.crewBox, { backgroundColor: colors.surfaceSubtle }]}>
            <View style={styles.crewLeft}>
              <View style={[styles.crewAvatar, { backgroundColor: colors.primary }]}>
                <UserCheck size={16} color="#fff" />
              </View>
              <View>
                <Text fontWeight="700" style={styles.crewName}>
                  {item.assignedCrew.name}
                </Text>
                <View style={styles.crewRatingRow}>
                  <Star size={12} color={colors.accent} fill={colors.accent} />
                  <Text style={[styles.crewRatingText, { color: colors.inkMuted }]}>
                    {item.assignedCrew.rating || '4.9'} • Certified Caregiver
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Address */}
        {item.address?.formattedAddress ? (
          <View style={styles.addressRow}>
            <MapPin size={14} color={colors.inkMuted} />
            <Text numberOfLines={1} style={[styles.addressText, { color: colors.inkMuted }]}>
              {item.address.formattedAddress}
            </Text>
          </View>
        ) : null}

        {/* Footer info: Payment state & Grand Total */}
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={styles.paymentMethodPill}>
            <Text style={[styles.paymentMethodText, { color: colors.inkMuted }]}>
              Payment:{' '}
              <Text
                fontWeight="700"
                style={{
                  color: isPaid ? '#16a34a' : isCod ? '#d97706' : '#dc2626',
                }}
              >
                {isPaid ? 'PAID ONLINE' : isCod ? 'COD (DUE AT DOORSTEP)' : 'PENDING'}
              </Text>
            </Text>
          </View>
          <Text variant="heading" fontWeight="800" style={styles.totalAmount}>
            ₹{item.grandTotal ? item.grandTotal.toFixed(0) : '—'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.titleRow}>
        <Text variant="heading" fontWeight="700" style={[styles.title, { color: colors.ink }]}>
          Bookings
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.inkMuted }]}>
            Loading your bookings...
          </Text>
        </View>
      ) : !bookings || bookings.length === 0 ? (
        <View style={styles.empty}>
          <View
            style={[
              styles.icon,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}
          >
            <Calendar size={28} color={colors.inkFaint} strokeWidth={2} />
          </View>
          <Text
            variant="heading"
            fontWeight="700"
            style={[styles.emptyTitle, { color: colors.ink }]}
          >
            No bookings yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.inkMuted }]}>
            Once you select and book a caregiving session, track real-time dispatch right here.
          </Text>
          <Button
            label="Browse services"
            onPress={() => router.push('/services')}
            fullWidth={false}
          />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: 22,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: { fontSize: 17 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: spacing.md, lineHeight: 20 },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  bookingCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingCode: {
    fontSize: 16,
  },
  bookingDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusText: {
    fontSize: 11,
  },
  serviceSection: {
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceName: {
    fontSize: 14,
  },
  variantName: {
    fontSize: 12,
    marginTop: 2,
  },
  lineTotal: {
    fontSize: 14,
  },
  crewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radii.md,
  },
  crewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  crewAvatar: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewName: {
    fontSize: 13,
  },
  crewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  crewRatingText: {
    fontSize: 11,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  paymentMethodPill: {},
  paymentMethodText: {
    fontSize: 12,
  },
  totalAmount: {
    fontSize: 18,
  },
});
