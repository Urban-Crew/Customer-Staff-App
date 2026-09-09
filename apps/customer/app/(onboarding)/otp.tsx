import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Clock, MessageSquare } from 'lucide-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, OnboardingLayout, OtpInput, useTheme, useToast } from '@ub/ui';
import type { OtpChannel } from '@ub/shared-types';
import { describeOtpError, toE164 } from '../../lib/otp';
import { useAuthStore } from '../../lib/store/authStore';
import { useOnboardingFlowStore } from '../../lib/store/onboardingFlowStore';
import { useResendOtp, useVerifyOtp } from '../../services/otp.service';

export default function OtpScreen() {
  const { colors } = useTheme();
  const { showSuccess, showError } = useToast();
  const countryCode = useOnboardingFlowStore((s) => s.countryCode);
  const phone = useOnboardingFlowStore((s) => s.phone);
  const requestId = useOnboardingFlowStore((s) => s.requestId);
  const resendAvailableInSeconds = useOnboardingFlowStore((s) => s.resendAvailableInSeconds);
  const setOtpRequest = useOnboardingFlowStore((s) => s.setOtpRequest);
  const setSession = useAuthStore((s) => s.setSession);

  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(resendAvailableInSeconds);
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const canVerify = otp.length === 6 && !!requestId;

  const handleVerify = () => {
    if (!canVerify || verifyOtp.isPending) return;

    verifyOtp.mutate(
      { phone: toE164(countryCode, phone), requestId: requestId!, otp },
      {
        onSuccess: async ({ user, tokens, isNewUser }) => {
          await setSession(user, tokens, isNewUser);
          // New accounts don't have an email yet — collect it before location.
          // Returning users skip straight to location, which is always asked.
          router.push(isNewUser ? '/(onboarding)/email' : '/(onboarding)/location-choice');
        },
        onError: () => {
          setOtp('');
        },
      },
    );
  };

  const handleResend = (channel: OtpChannel) => {
    if (!requestId || resendOtp.isPending) return;
    setOtp('');
    verifyOtp.reset();
    resendOtp.mutate(
      { requestId, channel },
      {
        onSuccess: (result) => {
          setOtpRequest(result.requestId, result.resendAvailableInSeconds);
          setSecondsLeft(result.resendAvailableInSeconds);
          showSuccess(channel === 'wapp' ? 'Code resent on WhatsApp.' : 'Code resent via SMS.');
        },
        onError: (err) => {
          showError(describeOtpError(err));
        },
      },
    );
  };

  const timerLabel = `00:${String(Math.max(secondsLeft, 0)).padStart(2, '0')}`;
  const busy = verifyOtp.isPending || resendOtp.isPending;
  const error = verifyOtp.error ?? resendOtp.error;

  return (
    <OnboardingLayout
      title="Enter the code"
      onBack={() => router.back()}
      primaryAction={{
        label: 'Continue',
        onPress: handleVerify,
        disabled: !canVerify,
        loading: verifyOtp.isPending,
      }}
      description={
        <>
          Sent to{' '}
          <Text style={[styles.phone, { color: colors.ink }]}>
            {countryCode} {phone}
          </Text>
        </>
      }
    >
      <OtpInput value={otp} onChangeText={setOtp} autoFocus editable={!busy} />
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{describeOtpError(error)}</Text>
      ) : null}

      {secondsLeft > 0 ? (
        <View style={styles.timerRow}>
          <Clock size={16} color={colors.inkMuted} />
          <Text style={[styles.timerLabel, { color: colors.inkMuted }]}>{timerLabel}</Text>
        </View>
      ) : (
        <View style={styles.resendBlock}>
          <Text style={[styles.resendLabel, { color: colors.inkMuted }]}>Resend the code on</Text>
          <View style={styles.resendRow}>
            <Button
              label="SMS"
              variant="secondary"
              size="sm"
              fullWidth={false}
              icon={<MessageSquare size={16} color={colors.secondaryText} />}
              onPress={() => handleResend('sms')}
              disabled={busy}
              loading={resendOtp.isPending && resendOtp.variables?.channel === 'sms'}
            />
            <Button
              label="WhatsApp"
              variant="secondary"
              size="sm"
              fullWidth={false}
              icon={
                <Image
                  source={require('../../assets/whatsapp.png')}
                  style={{ width: 16, height: 16 }}
                  resizeMode="contain"
                />
              }
              onPress={() => handleResend('wapp')}
              disabled={busy}
              loading={resendOtp.isPending && resendOtp.variables?.channel === 'wapp'}
            />
          </View>
        </View>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  phone: { fontWeight: '700' },
  error: { fontSize: 13 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerLabel: { fontSize: 14 },
  resendBlock: { gap: 12 },
  resendLabel: { fontSize: 14 },
  resendRow: { flexDirection: 'row', gap: 12 },
});
