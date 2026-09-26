import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { ShieldCheck, X } from 'lucide-react-native';
import { radii, spacing, Text, useTheme } from '@ub/ui';
import type { RazorpayPaymentIntent } from '@ub/shared-types';

export interface RazorpaySuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayModalProps {
  visible: boolean;
  paymentIntent: RazorpayPaymentIntent | null;
  customerPhone?: string;
  customerName?: string;
  onSuccess: (payload: RazorpaySuccessPayload) => void;
  onDismiss: () => void;
  onError?: (err: Error) => void;
}

export function RazorpayModal({
  visible,
  paymentIntent,
  customerPhone,
  customerName,
  onSuccess,
  onDismiss,
  onError,
}: RazorpayModalProps) {
  const { colors } = useTheme();
  const webViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  if (!visible || !paymentIntent) return null;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Razorpay Checkout</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            color: #64748b;
            font-size: 14px;
          }
          .spinner {
            width: 36px;
            height: 36px;
            border: 3px solid #e2e8f0;
            border-top-color: #0284c7;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <div class="loader">
          <div class="spinner"></div>
          <div>Opening secure payment gateway...</div>
        </div>

        <script>
          const postToNative = (payload) => {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            }
          };

          const cleanPhone = "${customerPhone || ''}".replace(/[^0-9+]/g, '');
          const options = {
            key: "${paymentIntent.keyId}",
            amount: ${paymentIntent.amount},
            currency: "${paymentIntent.currency || 'INR'}",
            name: "${paymentIntent.businessName || 'UrbanCrew Healthcare'}",
            description: "${paymentIntent.description || 'Service Advance Payment'}",
            order_id: "${paymentIntent.orderId}",
            prefill: {
              name: "${customerName || 'Care Patient'}",
              contact: cleanPhone
            },
            readonly: {
              contact: cleanPhone ? true : false
            },
            theme: {
              color: "#0f766e"
            },
            modal: {
              backdropclose: false,
              escape: false,
              handleback: true,
              ondismiss: function() {
                postToNative({ event: 'DISMISS' });
              }
            },
            handler: function(response) {
              postToNative({
                event: 'SUCCESS',
                data: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                }
              });
            }
          };

          try {
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function(response) {
              postToNative({
                event: 'ERROR',
                error: response.error
              });
            });
            rzp.open();
          } catch (err) {
            postToNative({ event: 'ERROR', message: err.message });
          }
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload.event === 'SUCCESS') {
        onSuccess(payload.data as RazorpaySuccessPayload);
      } else if (payload.event === 'DISMISS') {
        onDismiss();
      } else if (payload.event === 'ERROR') {
        onError?.(new Error(payload.error?.description || payload.message || 'Payment failed'));
      }
    } catch (err) {
      console.warn('[RazorpayModal] Failed to parse message', err);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <ShieldCheck size={20} color={colors.primary} />
            <Text variant="heading" fontWeight="700" style={styles.headerTitle}>
              Razorpay Secure Checkout
            </Text>
          </View>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.closeBtn,
              { backgroundColor: colors.surfaceSubtle },
              pressed && { opacity: 0.7 },
            ]}
            hitSlop={8}
          >
            <X size={18} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.body}>
          {loading && (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loaderText, { color: colors.inkMuted }]}>
                Connecting to Razorpay...
              </Text>
            </View>
          )}

          {React.createElement(WebView as any, {
            ref: webViewRef,
            originWhitelist: ['*'],
            source: { html: htmlContent, baseUrl: 'https://ubcrew.in' },
            onLoadEnd: () => setLoading(false),
            onMessage: handleMessage,
            style: [styles.webview, loading && styles.hidden],
            javaScriptEnabled: true,
            domStorageEnabled: true,
            mixedContentMode: 'always',
            allowsInlineMediaPlayback: true,
          })}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    position: 'relative',
  },
  loaderWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    zIndex: 2,
  },
  loaderText: {
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
});
