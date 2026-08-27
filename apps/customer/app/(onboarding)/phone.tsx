import { router } from 'expo-router';
import { Linking, Text } from 'react-native';
import { OnboardingLayout, PhoneInput } from '@ub/ui';
import { describeOtpError, toE164 } from '../../lib/otp';
import { useOnboardingFlowStore } from '../../lib/store/onboardingFlowStore';
import { useOnboardingStore } from '../../lib/store/onboardingStore';
import { useSendOtp } from '../../services/otp.service';

const TERMS_URL = 'https://ubcrew.in/terms';
const PRIVACY_URL = 'https://ubcrew.in/privacy';

export default function PhoneScreen() {
  const countryCode = useOnboardingFlowStore((s) => s.countryCode);
  const phone = useOnboardingFlowStore((s) => s.phone);
  const setCountryCode = useOnboardingFlowStore((s) => s.setCountryCode);
  const setPhone = useOnboardingFlowStore((s) => s.setPhone);
  const setOtpRequest = useOnboardingFlowStore((s) => s.setOtpRequest);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const sendOtp = useSendOtp();

  const canContinue = phone.trim().length >= 7;

  const handleContinue = () => {
    if (!canContinue || sendOtp.isPending) return;
    sendOtp.mutate(
      { phone: toE164(countryCode, phone) },
      {
        onSuccess: ({ requestId, resendAvailableInSeconds }) => {
          setOtpRequest(requestId, resendAvailableInSeconds);
          router.push('/(onboarding)/otp');
        },
      },
    );
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/');
  };

  return (
    <OnboardingLayout
      title="Enter your phone number"
      description="We'll send you a text with a verification code."
      onSkip={handleSkip}
      footnote={
        <>
          By continuing, you agree to our{' '}
          <Text
            style={{ textDecorationLine: 'underline', color: '#000' }}
            onPress={() => Linking.openURL(TERMS_URL)}
          >
            T&C
          </Text>{' '}
          and{' '}
          <Text
            style={{ textDecorationLine: 'underline', color: '#000' }}
            onPress={() => Linking.openURL(PRIVACY_URL)}
          >
            Privacy
          </Text>{' '}
          policy
        </>
      }
      primaryAction={{
        label: 'Send OTP',
        onPress: handleContinue,
        disabled: !canContinue,
        loading: sendOtp.isPending,
      }}
    >
      <PhoneInput
        countryCode={countryCode}
        onChangeCountryCode={setCountryCode}
        value={phone}
        onChangeText={setPhone}
        autoFocus
      />
      {sendOtp.error ? (
        <Text style={{ fontSize: 13, color: '#EF4444' }}>{describeOtpError(sendOtp.error)}</Text>
      ) : null}
    </OnboardingLayout>
  );
}
