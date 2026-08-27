import { forwardRef, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { MapPin, Plus } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text, spacing, useTheme } from '@ub/ui';
import type { SavedAddress } from '@ub/shared-types';
import { useAddresses } from '../hooks/useAddresses';

export interface AddressSheetProps {
  onSelect: (address: SavedAddress) => void;
}

export const AddressSheet = forwardRef<BottomSheetModal, AddressSheetProps>(function AddressSheet(
  { onSelect },
  ref,
) {
  const { colors } = useTheme();
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const snapPoints = useMemo(() => ['55%', '85%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
    ),
    [],
  );

  const handleAddPress = useCallback(() => {
    if (ref && 'current' in ref) ref.current?.dismiss();
    router.push('/address-add');
  }, [ref]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.hairline }}
    >
      <View style={styles.header}>
        <Text variant="heading" fontWeight="700" style={[styles.title, { color: colors.ink }]}>
          Select address
        </Text>
      </View>

      <Pressable
        onPress={handleAddPress}
        style={({ pressed }) => [
          styles.addRow,
          { borderColor: colors.secondaryBorder },
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.addIcon, { backgroundColor: colors.primary }]}>
          <Plus size={16} color={colors.primaryText} strokeWidth={2.5} />
        </View>
        <Text fontWeight="600" style={{ color: colors.ink }}>
          Add new address
        </Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerState}>
          <Text style={{ color: colors.inkMuted }}>Couldn't load your addresses.</Text>
          <Pressable onPress={() => refetch()} hitSlop={8}>
            <Text fontWeight="600" style={{ color: colors.primary, marginTop: spacing.xs }}>
              Try again
            </Text>
          </Pressable>
        </View>
      ) : !addresses?.length ? (
        <View style={styles.centerState}>
          <Text style={{ color: colors.inkMuted }}>No saved addresses yet.</Text>
        </View>
      ) : (
        <BottomSheetFlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item)}
              style={({ pressed }) => [
                styles.addressRow,
                { borderBottomColor: colors.hairline },
                pressed && styles.pressed,
              ]}
            >
              <MapPin size={18} color={colors.inkMuted} style={styles.addressIcon} />
              <View style={styles.addressText}>
                <Text fontWeight="700" style={{ color: colors.ink }}>
                  {item.label}
                  {item.isDefault ? '  ·  Default' : ''}
                </Text>
                <Text style={[styles.addressLine, { color: colors.inkMuted }]} numberOfLines={2}>
                  {item.formattedAddress}
                </Text>
                {!item.isServiceable ? (
                  <Text style={[styles.notServiceable, { color: colors.error }]}>
                    Not serviceable right now
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: 18 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  centerState: { alignItems: 'center', paddingVertical: spacing.xxl },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  addressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  addressIcon: { marginTop: 2 },
  addressText: { flex: 1 },
  addressLine: { fontSize: 13, marginTop: 2 },
  notServiceable: { fontSize: 12, marginTop: 4, fontWeight: '600' },
});
