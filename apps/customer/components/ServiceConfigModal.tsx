import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { X, Check, Plus, Minus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, cardStyle, radii, spacing, Text, useTheme, useToast } from '@ub/ui';
import { useAddToCart } from '../hooks/useCart';
import { useAuthStore } from '../lib/store/authStore';

export interface ServiceConfigItem {
  id: string;
  name: string;
  categoryName?: string;
  imageUrl?: string;
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
  }>;
  addons?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

interface ServiceConfigModalProps {
  visible: boolean;
  service: ServiceConfigItem | null;
  onClose: () => void;
}

export function ServiceConfigModal({ visible, service, onClose }: ServiceConfigModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { mutate: addToCart, isPending } = useAddToCart();

  const availableVariants = service?.variants || [];
  const availableAddons = service?.addons || [];

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  React.useEffect(() => {
    if (service?.variants && service.variants.length > 0) {
      setSelectedVariantId(service.variants[0].id);
    } else {
      setSelectedVariantId('');
    }
    setSelectedAddonIds([]);
    setQuantity(1);
    setNotes('');
  }, [service?.id]);

  if (!visible || !service) return null;

  const activeVariant =
    availableVariants.find((v) => v.id === selectedVariantId) || availableVariants[0];

  const addonsTotal = selectedAddonIds.reduce((sum, adId) => {
    const ad = availableAddons.find((a) => a.id === adId);
    return sum + (ad?.price || 0);
  }, 0);

  const totalPrice = activeVariant ? (activeVariant.price + addonsTotal) * quantity : 0;

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAddToCart = () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      showToast('Please sign in to add items to cart', 'error');
      onClose();
      router.push('/(onboarding)/phone');
      return;
    }

    if (!activeVariant) {
      showToast('No package variant available for this service', 'error');
      return;
    }

    addToCart(
      {
        serviceId: service.id,
        variantId: activeVariant.id,
        quantity,
        notes: notes.trim() || undefined,
        addons: selectedAddonIds.map((id) => ({ addonId: id, quantity: 1 })),
      },
      {
        onSuccess: () => {
          showToast('Added to cart!');
          onClose();
        },
        onError: (err) => {
          showToast(err.message || 'Failed to add item to cart', 'error');
        },
      },
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.serviceMeta}>
              {service.imageUrl ? (
                <Image source={{ uri: service.imageUrl }} style={styles.thumb} contentFit="cover" />
              ) : null}
              <View style={styles.titleWrap}>
                <Text variant="heading" fontWeight="700" style={styles.sheetTitle}>
                  {service.name}
                </Text>
                <Text style={[styles.categoryLabel, { color: colors.inkMuted }]}>
                  {service.categoryName || 'Home Healthcare'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: colors.surfaceSubtle },
                pressed && { opacity: 0.7 },
              ]}
            >
              <X size={18} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Shift / Variant Selection */}
            <Text fontWeight="700" style={styles.sectionHeader}>
              Choose Shift Duration
            </Text>
            {availableVariants.length === 0 ? (
              <Text
                style={{
                  color: colors.inkMuted,
                  marginVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                }}
              >
                No packages or variants available for this service yet.
              </Text>
            ) : (
              <View style={styles.variantList}>
                {availableVariants.map((variant) => {
                  const isSelected = variant.id === selectedVariantId;
                  return (
                    <Pressable
                      key={variant.id}
                      onPress={() => setSelectedVariantId(variant.id)}
                      style={[
                        styles.variantCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <View style={styles.variantRadio}>
                        <View
                          style={[
                            styles.radioOuter,
                            { borderColor: isSelected ? colors.primary : colors.border },
                          ]}
                        >
                          {isSelected && (
                            <View
                              style={[styles.radioInner, { backgroundColor: colors.primary }]}
                            />
                          )}
                        </View>
                        <View style={styles.variantTextCol}>
                          <Text fontWeight="700" style={styles.variantName}>
                            {variant.name}
                          </Text>
                          {variant.description ? (
                            <Text style={[styles.variantDesc, { color: colors.inkMuted }]}>
                              {variant.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <Text
                        fontWeight="800"
                        style={[styles.variantPrice, { color: colors.primary }]}
                      >
                        ₹{variant.price}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Addons */}
            {availableAddons.length > 0 ? (
              <>
                <Text fontWeight="700" style={styles.sectionHeader}>
                  Recommended Care Add-ons
                </Text>
                <View style={styles.addonList}>
                  {availableAddons.map((addon) => {
                    const isChecked = selectedAddonIds.includes(addon.id);
                    return (
                      <Pressable
                        key={addon.id}
                        onPress={() => toggleAddon(addon.id)}
                        style={[
                          styles.addonCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: isChecked ? colors.primary : colors.border,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <View style={styles.addonLeft}>
                          <View
                            style={[
                              styles.checkbox,
                              {
                                backgroundColor: isChecked ? colors.primary : 'transparent',
                                borderColor: isChecked ? colors.primary : colors.border,
                              },
                            ]}
                          >
                            {isChecked && <Check size={14} color="#fff" strokeWidth={3} />}
                          </View>
                          <Text style={styles.addonName}>{addon.name}</Text>
                        </View>
                        <Text fontWeight="700" style={styles.addonPrice}>
                          +₹{addon.price}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {/* Quantity Stepper */}
            <View style={styles.quantityRow}>
              <View>
                <Text fontWeight="700" style={styles.quantityLabel}>
                  Number of Days / Shifts
                </Text>
                <Text style={[styles.quantitySubtitle, { color: colors.inkMuted }]}>
                  Consecutive caregiving sessions
                </Text>
              </View>
              <View
                style={[
                  styles.stepper,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                ]}
              >
                <Pressable
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={styles.stepperBtn}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} color={quantity <= 1 ? colors.inkFaint : colors.ink} />
                </Pressable>
                <Text fontWeight="800" style={styles.stepperValue}>
                  {quantity}
                </Text>
                <Pressable onPress={() => setQuantity((q) => q + 1)} style={styles.stepperBtn}>
                  <Plus size={16} color={colors.ink} />
                </Pressable>
              </View>
            </View>

            {/* Special Instructions */}
            <Text fontWeight="700" style={styles.sectionHeader}>
              Patient Care Notes (Optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="E.g. Bedridden patient, post-op dressing, wheelchair assist..."
              placeholderTextColor={colors.inkFaint}
              multiline
              numberOfLines={2}
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.ink,
                },
              ]}
            />
          </ScrollView>

          {/* Sticky Bottom CTA */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <View>
              <Text style={[styles.totalLabel, { color: colors.inkMuted }]}>Total Estimate</Text>
              <Text variant="heading" fontWeight="800" style={styles.totalAmount}>
                ₹{totalPrice.toFixed(0)}
              </Text>
            </View>
            <Button
              label={isPending ? 'Adding...' : `Add to Cart • ₹${totalPrice.toFixed(0)}`}
              onPress={handleAddToCart}
              loading={isPending}
              fullWidth={false}
              style={styles.addBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: radii.squircle,
    borderTopRightRadius: radii.squircle,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
  },
  titleWrap: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    fontSize: 14,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  variantList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  variantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.md,
  },
  variantRadio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  variantTextCol: {
    flex: 1,
  },
  variantName: {
    fontSize: 14,
  },
  variantDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  variantPrice: {
    fontSize: 15,
  },
  addonList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radii.md,
  },
  addonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addonName: {
    fontSize: 13,
  },
  addonPrice: {
    fontSize: 13,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  quantityLabel: {
    fontSize: 14,
  },
  quantitySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 15,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    fontSize: 13,
    marginBottom: spacing.xl,
    minHeight: 60,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 11,
  },
  totalAmount: {
    fontSize: 20,
  },
  addBtn: {
    minWidth: 180,
  },
});
