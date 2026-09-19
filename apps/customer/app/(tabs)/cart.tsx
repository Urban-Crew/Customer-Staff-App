import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Banknote,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
} from 'lucide-react-native';
import { Button, cardStyle, radii, spacing, Text, useTheme, useToast } from '@ub/ui';
import type { CartItem, PaymentMethod } from '@ub/shared-types';
import { AddressSheet } from '../../components/AddressSheet';
import { RazorpayModal, type RazorpaySuccessPayload } from '../../components/RazorpayModal';
import {
  useApplyCoupon,
  useCart,
  useCheckout,
  usePaymentOptions,
  useRemoveCartItem,
  useRemoveCoupon,
  useUpdateCartItem,
} from '../../hooks/useCart';
import { useLocationStore, type SelectedAddress } from '../../lib/store/locationStore';
import { useAuthStore } from '../../lib/store/authStore';
import { useOnboardingFlowStore } from '../../lib/store/onboardingFlowStore';
import { useAddresses } from '../../hooks/useAddresses';
import { addAddress } from '../../services/address.service';
import { verifyPayment } from '../../services/payment.service';

export default function CartScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const { data: cart, isLoading: isCartLoading, refetch: refetchCart } = useCart();
  const { data: paymentOptions } = usePaymentOptions();
  const { mutate: updateCartItem } = useUpdateCartItem();
  const { mutate: removeCartItem } = useRemoveCartItem();
  const { mutate: applyCoupon, isPending: isApplyingCoupon } = useApplyCoupon();
  const { mutate: removeCoupon, isPending: isRemovingCoupon } = useRemoveCoupon();
  const { mutate: checkout, isPending: isCheckingOut } = useCheckout();

  const selectedAddress = useLocationStore((s) => s.address);
  const setSelectedAddress = useLocationStore((s) => s.setAddress);
  const addressSheetRef = useRef<BottomSheetModal>(null);

  const [couponCode, setCouponCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment method state (default to backend admin config)
  const defaultMethod = paymentOptions?.defaultMethod || 'ONLINE';
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // Razorpay Modal state
  const [razorpayModalVisible, setRazorpayModalVisible] = useState(false);
  const [activePaymentIntent, setActivePaymentIntent] = useState<any>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const user = useAuthStore((s) => s.user);
  const onboardingPhone = useOnboardingFlowStore((s) => s.phone);
  const customerPhone: string | undefined =
    (user && 'phone' in user && typeof user.phone === 'string' && user.phone
      ? user.phone
      : undefined) ||
    onboardingPhone ||
    undefined;
  const rawName = user && 'name' in user && typeof user.name === 'string' ? user.name : undefined;
  const rawFullName =
    user && 'fullName' in user && typeof (user as any).fullName === 'string'
      ? ((user as any).fullName as string)
      : undefined;
  const customerName: string = rawName || rawFullName || 'Care Patient';

  const getAddressDisplayText = (addr: SelectedAddress | null): string => {
    if (!addr) return '';
    const anyAddr = addr as any;
    if (anyAddr.formattedAddress) return anyAddr.formattedAddress;
    if (anyAddr.formattedAddr) return anyAddr.formattedAddr;
    const parts = [anyAddr.flatNo, anyAddr.areaText, anyAddr.landmark].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
    if (anyAddr.shortLine) return anyAddr.shortLine;
    return '';
  };

  const addressText = getAddressDisplayText(selectedAddress);
  const savedAddressId =
    selectedAddress && 'id' in selectedAddress ? selectedAddress.id : undefined;
  const addressLabel =
    selectedAddress && 'label' in selectedAddress ? selectedAddress.label : 'Home';

  const currentMethod: PaymentMethod =
    selectedPaymentMethod ||
    (paymentOptions?.isOnlineEnabled
      ? defaultMethod
      : paymentOptions?.isCodEnabled
        ? 'COD'
        : 'ONLINE');

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      showToast('Please enter a promo code', 'error');
      return;
    }
    applyCoupon(couponCode.trim(), {
      onSuccess: () => {
        showToast('Coupon applied successfully!');
        setCouponCode('');
      },
      onError: (err) => {
        showToast(err.message || 'Invalid coupon code', 'error');
      },
    });
  };

  const handleRemoveCoupon = () => {
    removeCoupon(undefined, {
      onSuccess: () => showToast('Coupon removed'),
      onError: (err) => showToast(err.message, 'error'),
    });
  };

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeCartItem(item.id);
    } else {
      updateCartItem({ itemId: item.id, payload: { quantity: newQty } });
    }
  };

  const { data: savedAddresses } = useAddresses();

  // Sync selectedAddress with live savedAddresses from database:
  // 1. If selectedAddress has an ID that no longer exists in DB, fall back to default or clear it
  // 2. If no address is selected, auto-select the default saved address from account
  React.useEffect(() => {
    if (!savedAddresses) return;
    if (savedAddresses.length > 0) {
      const exists =
        selectedAddress &&
        'id' in selectedAddress &&
        savedAddresses.some((a) => a.id === selectedAddress.id);
      if (!exists) {
        const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        }
      }
    } else if (selectedAddress && 'id' in selectedAddress) {
      // All saved addresses were deleted from backend database — clear stale cached address
      setSelectedAddress(null as any);
    }
  }, [selectedAddress, savedAddresses, setSelectedAddress]);

  const handleSelectAddress = (address: SelectedAddress) => {
    setSelectedAddress(address);
    addressSheetRef.current?.dismiss();
  };

  const handleProceedToCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!selectedAddress) {
      Alert.alert(
        'Delivery Address Required',
        'Please select or add a patient delivery address with house/flat number.',
        [
          { text: 'Choose Address', onPress: () => addressSheetRef.current?.present() },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }

    // Resolve address ID (from saved address or auto-save resolved address)
    let finalAddressId =
      'id' in selectedAddress && selectedAddress.id ? selectedAddress.id : undefined;

    if (!finalAddressId) {
      if ('coordinates' in selectedAddress && selectedAddress.coordinates) {
        try {
          const newAddr = await addAddress({
            label: 'Home',
            flatNo: '1',
            areaText: selectedAddress.shortLine || selectedAddress.city || 'Area',
            formattedAddr: selectedAddress.formattedAddress,
            latitude: selectedAddress.coordinates.latitude,
            longitude: selectedAddress.coordinates.longitude,
            isDefault: true,
          });
          finalAddressId = newAddr.id;
          setSelectedAddress(newAddr);
        } catch {
          // If geofence/zone fails or backend fallback is needed:
          finalAddressId = '00000000-0000-0000-0000-000000000000';
        }
      } else {
        finalAddressId = '00000000-0000-0000-0000-000000000000';
      }
    }

    // Check admin restrictions
    if (currentMethod === 'COD' && !paymentOptions?.isCodEnabled) {
      showToast('Cash on delivery is currently disabled. Please select Online Payment.', 'error');
      return;
    }

    if (currentMethod === 'ONLINE' && !paymentOptions?.isOnlineEnabled) {
      showToast('Online payment is currently disabled. Please select Cash on Delivery.', 'error');
      return;
    }

    const payload = {
      addressId: finalAddressId,
      paymentMethod: currentMethod,
      notes: orderNotes.trim() || undefined,
    };

    checkout(payload, {
      onSuccess: (res) => {
        if (currentMethod === 'COD') {
          // Immediate COD confirmation
          router.replace({
            pathname: '/order-success',
            params: {
              bookingId: res.bookingId,
              bookingCode: res.bookingCode,
              paymentMethod: 'COD',
              grandTotal: res.grandTotal.toString(),
            },
          });
        } else if (currentMethod === 'ONLINE' && res.paymentIntent) {
          // Open Razorpay SDK modal
          setActiveBookingId(res.bookingId);
          setActivePaymentIntent(res.paymentIntent);
          setRazorpayModalVisible(true);
        }
      },
      onError: (err: any) => {
        if (err.response?.status === 409) {
          showToast('This cart was already checked out. Refreshing...', 'error');
          refetchCart();
        } else {
          showToast(err.response?.data?.message || err.message || 'Checkout failed', 'error');
        }
      },
    });
  };

  const handleRazorpaySuccess = async (payload: RazorpaySuccessPayload) => {
    setRazorpayModalVisible(false);
    if (!activeBookingId) return;

    setIsVerifyingPayment(true);
    try {
      const verifyRes = await verifyPayment({
        bookingId: activeBookingId,
        razorpayOrderId: payload.razorpay_order_id,
        razorpayPaymentId: payload.razorpay_payment_id,
        razorpaySignature: payload.razorpay_signature,
      });

      router.replace({
        pathname: '/order-success',
        params: {
          bookingId: verifyRes.bookingId,
          bookingCode: verifyRes.bookingCode,
          paymentMethod: 'ONLINE',
          grandTotal: cart?.pricing.grandTotal.toString() || '0',
        },
      });
    } catch (err: any) {
      showToast('Payment verification pending. Checking status...', 'error');
      router.replace({
        pathname: '/order-success',
        params: {
          bookingId: activeBookingId,
          paymentMethod: 'ONLINE',
          grandTotal: cart?.pricing.grandTotal.toString() || '0',
        },
      });
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  if (isCartLoading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.inkMuted }]}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty cart view
  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          {router.canGoBack() ? (
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
              <ArrowLeft size={20} color={colors.ink} />
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Text variant="heading" fontWeight="700" style={styles.headerTitle}>
            Your Cart
          </Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSubtle }]}>
            <ShoppingBag size={48} color={colors.inkFaint} />
          </View>
          <Text variant="heading" fontWeight="700" style={styles.emptyTitle}>
            Your cart is empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.inkMuted }]}>
            Explore our professional healthcare & nursing services to book care for yourself or
            loved ones.
          </Text>
          <Button
            label="Explore Services"
            onPress={() => router.push('/services')}
            fullWidth={false}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Navigation */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {router.canGoBack() ? (
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <ArrowLeft size={20} color={colors.ink} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text variant="heading" fontWeight="700" style={styles.headerTitle}>
          Review & Checkout ({cart.itemCount})
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Delivery Address Card */}
        <View style={styles.sectionHeaderRow}>
          <Text fontWeight="700" style={styles.sectionTitle}>
            Patient Delivery Address
          </Text>
        </View>
        <Pressable
          onPress={() => addressSheetRef.current?.present()}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.addressLeft}>
            <View style={[styles.addressIcon, { backgroundColor: colors.surfaceSubtle }]}>
              <MapPin size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text fontWeight="700" style={styles.addressLabel}>
                {addressLabel}
              </Text>
              <Text numberOfLines={2} style={[styles.addressText, { color: colors.inkMuted }]}>
                {addressText || 'No address selected. Tap to choose.'}
              </Text>
            </View>
          </View>
          <Text fontWeight="700" style={[styles.changeLink, { color: colors.primary }]}>
            Change
          </Text>
        </Pressable>

        {/* Selected Services & Items */}
        <View style={styles.sectionHeaderRow}>
          <Text fontWeight="700" style={styles.sectionTitle}>
            Care Services Selected
          </Text>
        </View>
        <View style={styles.itemsList}>
          {cart.items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.itemTopRow}>
                {item.thumbnailUrl ? (
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.itemThumb}
                    contentFit="cover"
                  />
                ) : null}
                <View style={styles.itemInfo}>
                  <Text fontWeight="700" style={styles.itemName}>
                    {item.serviceName}
                  </Text>
                  <Text style={[styles.itemVariant, { color: colors.primary }]}>
                    {item.variantName}
                  </Text>
                  {item.notes ? (
                    <Text style={[styles.itemNotes, { color: colors.inkMuted }]}>
                      Note: {item.notes}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => removeCartItem(item.id)}
                  style={styles.trashBtn}
                  hitSlop={8}
                >
                  <Trash2 size={16} color={colors.inkFaint} />
                </Pressable>
              </View>

              {/* Addons if any */}
              {item.addons && item.addons.length > 0 && (
                <View style={[styles.addonsWrap, { borderTopColor: colors.surfaceSubtle }]}>
                  {item.addons.map((ad) => (
                    <View key={ad.addonId} style={styles.addonLine}>
                      <Text style={[styles.addonLineName, { color: colors.inkMuted }]}>
                        + {ad.addonName} (x{ad.quantity})
                      </Text>
                      <Text fontWeight="600" style={styles.addonLinePrice}>
                        ₹{(ad.price * ad.quantity).toFixed(0)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Price & Stepper Row */}
              <View style={styles.itemBottomRow}>
                <Text variant="heading" fontWeight="800" style={styles.itemPrice}>
                  ₹{item.lineTotal.toFixed(0)}
                </Text>
                <View
                  style={[
                    styles.stepper,
                    { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                  ]}
                >
                  <Pressable
                    onPress={() => handleQuantityChange(item, -1)}
                    style={styles.stepperBtn}
                  >
                    <Minus size={14} color={colors.ink} />
                  </Pressable>
                  <Text fontWeight="700" style={styles.stepperValue}>
                    {item.quantity}
                  </Text>
                  <Pressable
                    onPress={() => handleQuantityChange(item, 1)}
                    style={styles.stepperBtn}
                  >
                    <Plus size={14} color={colors.ink} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Coupons / Promo Code Section */}
        <View style={styles.sectionHeaderRow}>
          <Text fontWeight="700" style={styles.sectionTitle}>
            Promotions & Discounts
          </Text>
        </View>
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {cart.coupon ? (
            <View style={styles.appliedCouponRow}>
              <View style={styles.couponPill}>
                <Tag size={16} color={colors.primary} />
                <Text fontWeight="800" style={[styles.couponCodeText, { color: colors.primary }]}>
                  {cart.coupon.code}
                </Text>
                <Text style={[styles.couponTitleText, { color: colors.inkMuted }]}>
                  • ₹{cart.pricing.discount.toFixed(0)} off
                </Text>
              </View>
              <Pressable
                onPress={handleRemoveCoupon}
                disabled={isRemovingCoupon}
                style={styles.removeCouponBtn}
              >
                <Text fontWeight="700" style={styles.removeCouponText}>
                  {isRemovingCoupon ? '...' : 'Remove'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.couponInputRow}>
              <TextInput
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Enter coupon code (e.g. FIRSTCARE10)"
                placeholderTextColor={colors.inkFaint}
                autoCapitalize="characters"
                style={[
                  styles.couponInput,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    color: colors.ink,
                  },
                ]}
              />
              <Button
                label={isApplyingCoupon ? '...' : 'Apply'}
                onPress={handleApplyCoupon}
                loading={isApplyingCoupon}
                fullWidth={false}
                style={styles.couponApplyBtn}
              />
            </View>
          )}
        </View>

        {/* Dynamic Payment Method Selector (Admin Controlled) */}
        <View style={styles.sectionHeaderRow}>
          <Text fontWeight="700" style={styles.sectionTitle}>
            Payment Option
          </Text>
        </View>
        <View style={styles.paymentSection}>
          {/* Online Razorpay Card */}
          <Pressable
            disabled={!paymentOptions?.isOnlineEnabled}
            onPress={() => setSelectedPaymentMethod('ONLINE')}
            style={[
              styles.paymentCard,
              {
                backgroundColor: colors.surface,
                borderColor: currentMethod === 'ONLINE' ? colors.primary : colors.border,
                borderWidth: currentMethod === 'ONLINE' ? 2 : 1,
                opacity: paymentOptions?.isOnlineEnabled ? 1 : 0.6,
              },
            ]}
          >
            <View style={styles.paymentLeft}>
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: currentMethod === 'ONLINE' ? colors.primary : colors.border },
                ]}
              >
                {currentMethod === 'ONLINE' && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <View style={[styles.paymentIconWrap, { backgroundColor: colors.surfaceSubtle }]}>
                <CreditCard size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text fontWeight="700" style={styles.paymentMethodName}>
                  Online Payment
                </Text>
                <Text style={[styles.paymentMethodSub, { color: colors.inkMuted }]}>
                  UPI (GPay, PhonePe, Paytm), Cards, NetBanking
                </Text>
              </View>
            </View>
            {!paymentOptions?.isOnlineEnabled && (
              <View style={[styles.disabledBadge, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.disabledBadgeText, { color: colors.inkMuted }]}>
                  Disabled by Admin
                </Text>
              </View>
            )}
          </Pressable>

          {/* Cash on Delivery Card */}
          <Pressable
            disabled={!paymentOptions?.isCodEnabled}
            onPress={() => setSelectedPaymentMethod('COD')}
            style={[
              styles.paymentCard,
              {
                backgroundColor: colors.surface,
                borderColor: currentMethod === 'COD' ? colors.primary : colors.border,
                borderWidth: currentMethod === 'COD' ? 2 : 1,
                opacity: paymentOptions?.isCodEnabled ? 1 : 0.6,
              },
            ]}
          >
            <View style={styles.paymentLeft}>
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: currentMethod === 'COD' ? colors.primary : colors.border },
                ]}
              >
                {currentMethod === 'COD' && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <View style={[styles.paymentIconWrap, { backgroundColor: colors.surfaceSubtle }]}>
                <Banknote size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text fontWeight="700" style={styles.paymentMethodName}>
                  Cash on Delivery (Doorstep)
                </Text>
                <Text style={[styles.paymentMethodSub, { color: colors.inkMuted }]}>
                  Pay cash to assigned crew upon arrival / service completion
                </Text>
              </View>
            </View>
            {!paymentOptions?.isCodEnabled && (
              <View style={[styles.disabledBadge, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.disabledBadgeText, { color: colors.inkMuted }]}>
                  Disabled by Admin
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Additional Instructions */}
        <View style={styles.sectionHeaderRow}>
          <Text fontWeight="700" style={styles.sectionTitle}>
            Arrival Notes for Crew (Optional)
          </Text>
        </View>
        <TextInput
          value={orderNotes}
          onChangeText={setOrderNotes}
          placeholder="E.g. Ring doorbell, second floor, ask for Dr. Verma..."
          placeholderTextColor={colors.inkFaint}
          multiline
          numberOfLines={2}
          style={[
            styles.orderNotesInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.ink,
            },
          ]}
        />

        {/* Bill Breakdown */}
        <View style={styles.sectionHeaderRow}>
          <Text fontWeight="700" style={styles.sectionTitle}>
            Bill Details
          </Text>
        </View>
        <View
          style={[styles.billCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.inkMuted }]}>Items Subtotal</Text>
            <Text fontWeight="600" style={styles.billValue}>
              ₹{cart.pricing.itemsSubtotal.toFixed(0)}
            </Text>
          </View>

          {cart.pricing.addonsTotal > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.inkMuted }]}>
                Add-ons & Consumables
              </Text>
              <Text fontWeight="600" style={styles.billValue}>
                ₹{cart.pricing.addonsTotal.toFixed(0)}
              </Text>
            </View>
          )}

          {cart.pricing.discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.success || '#16a34a' }]}>
                Coupon Discount
              </Text>
              <Text
                fontWeight="700"
                style={[styles.billValue, { color: colors.success || '#16a34a' }]}
              >
                - ₹{cart.pricing.discount.toFixed(0)}
              </Text>
            </View>
          )}

          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.inkMuted }]}>Taxes & GST (18%)</Text>
            <Text fontWeight="600" style={styles.billValue}>
              ₹{cart.pricing.tax.toFixed(0)}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.inkMuted }]}>Platform Fee</Text>
            <Text fontWeight="600" style={styles.billValue}>
              ₹{cart.pricing.platformFee.toFixed(0)}
            </Text>
          </View>

          <View style={[styles.billDivider, { backgroundColor: colors.border }]} />

          <View style={styles.grandTotalRow}>
            <View>
              <Text variant="heading" fontWeight="800" style={styles.grandTotalLabel}>
                Grand Total
              </Text>
              <Text style={[styles.taxInclusiveText, { color: colors.inkMuted }]}>
                Inclusive of all taxes
              </Text>
            </View>
            <Text variant="heading" fontWeight="800" style={styles.grandTotalValue}>
              ₹{cart.pricing.grandTotal.toFixed(0)}
            </Text>
          </View>
        </View>

        {/* Security / Safety Trust Badge */}
        <View style={styles.trustBadgeRow}>
          <ShieldCheck size={18} color={colors.primary} />
          <Text style={[styles.trustBadgeText, { color: colors.inkMuted }]}>
            100% Background-verified Caregivers • Secure Payment Protection
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: spacing.md,
          },
        ]}
      >
        <View>
          <Text style={[styles.bottomAmountLabel, { color: colors.inkMuted }]}>Amount to Pay</Text>
          <Text variant="heading" fontWeight="800" style={styles.bottomAmountValue}>
            ₹{cart.pricing.grandTotal.toFixed(0)}
          </Text>
        </View>
        <Button
          label={
            isCheckingOut || isVerifyingPayment
              ? 'Processing...'
              : currentMethod === 'COD'
                ? 'Place Order with COD'
                : `Pay ₹${cart.pricing.grandTotal.toFixed(0)} & Book`
          }
          onPress={handleProceedToCheckout}
          loading={isCheckingOut || isVerifyingPayment}
          fullWidth={false}
          style={styles.checkoutBtn}
        />
      </View>

      {/* Address Selector Bottom Sheet */}
      <AddressSheet ref={addressSheetRef} onSelect={handleSelectAddress} />

      {/* Razorpay Checkout Modal */}
      <RazorpayModal
        visible={razorpayModalVisible}
        paymentIntent={activePaymentIntent}
        customerPhone={customerPhone}
        customerName={customerName}
        onSuccess={handleRazorpaySuccess}
        onDismiss={() => {
          setRazorpayModalVisible(false);
          showToast('Payment cancelled. You can retry or choose COD.', 'info');
        }}
        onError={(err) => {
          setRazorpayModalVisible(false);
          showToast(err.message || 'Payment failed', 'error');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: 18,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHeaderRow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressLabel: {
    fontSize: 14,
  },
  addressText: {
    fontSize: 12,
    marginTop: 2,
  },
  changeLink: {
    fontSize: 13,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
  },
  itemVariant: {
    fontSize: 12,
    marginTop: 2,
  },
  itemNotes: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  trashBtn: {
    padding: 4,
  },
  addonsWrap: {
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    gap: 2,
  },
  addonLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addonLineName: {
    fontSize: 12,
  },
  addonLinePrice: {
    fontSize: 12,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  itemPrice: {
    fontSize: 16,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 14,
  },
  appliedCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  couponCodeText: {
    fontSize: 14,
  },
  couponTitleText: {
    fontSize: 13,
  },
  removeCouponBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeCouponText: {
    color: '#ef4444',
    fontSize: 13,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 13,
  },
  couponApplyBtn: {
    minWidth: 80,
  },
  paymentSection: {
    gap: spacing.sm,
  },
  paymentCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentLeft: {
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
  paymentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodName: {
    fontSize: 14,
  },
  paymentMethodSub: {
    fontSize: 12,
    marginTop: 2,
  },
  disabledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  disabledBadgeText: {
    fontSize: 11,
  },
  orderNotesInput: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 13,
    minHeight: 56,
  },
  billCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  billLabel: {
    fontSize: 13,
  },
  billValue: {
    fontSize: 13,
  },
  billDivider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
  },
  taxInclusiveText: {
    fontSize: 11,
    marginTop: 2,
  },
  grandTotalValue: {
    fontSize: 20,
  },
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  trustBadgeText: {
    fontSize: 11,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  bottomAmountLabel: {
    fontSize: 11,
  },
  bottomAmountValue: {
    fontSize: 20,
  },
  checkoutBtn: {
    minWidth: 200,
  },
});
