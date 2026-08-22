import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Clock, Smartphone } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Button, OnboardingLayout, OtpInput, useTheme } from '@ub/ui';
import { mockSendOtp, mockVerifyOtp } from '../../lib/onboardingMock';
import { useOnboardingFlowStore } from '../../lib/store/onboardingFlowStore';

const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const { colors } = useTheme();
  const countryCode = useOnboardingFlowStore((s) => s.countryCode);
  const phone = useOnboardingFlowStore((s) => s.phone);
  const setRequestId = useOnboardingFlowStore((s) => s.setRequestId);

  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (otp.length !== 6 || submitting) return;

    let cancelled = false;
    setSubmitting(true);
    setError(false);
    mockVerifyOtp(otp).then((valid) => {
      if (cancelled) return;
      setSubmitting(false);
      if (valid) {
        router.push('/(onboarding)/email');
      } else {
        setError(true);
        setOtp('');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [otp]);

  const handleResend = async () => {
    setOtp('');
    setError(false);
    setSecondsLeft(RESEND_SECONDS);
    const { requestId } = await mockSendOtp();
    setRequestId(requestId);
  };

  const timerLabel = `00:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <OnboardingLayout
      icon={<Smartphone size={26} color={colors.ink} />}
      title="Enter verification code"
      onBack={() => router.back()}
      description={
        <>
          A 6-digit verification code has been sent to{'\n'}
          <Text style={[styles.phone, { color: colors.ink }]}>
            {countryCode} {phone}
          </Text>
        </>
      }
    >
      <OtpInput value={otp} onChangeText={setOtp} autoFocus />
      {error ? <Text style={styles.error}>That code didn't work — try again.</Text> : null}

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
              onPress={handleResend}
            />
            <Button
              label="WhatsApp"
              variant="secondary"
              size="sm"
              fullWidth={false}
              onPress={handleResend}
            />
          </View>
        </View>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  phone: { fontWeight: '700' },
  error: { fontSize: 13, color: '#EF4444' },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerLabel: { fontSize: 14 },
  resendBlock: { gap: 12 },
  resendLabel: { fontSize: 14 },
  resendRow: { flexDirection: 'row', gap: 12 },
});
