import { useState } from 'react';
import { router } from 'expo-router';
import { Linking, Text } from 'react-native';
import { Phone } from 'lucide-react-native';
import { OnboardingLayout, PhoneInput, useTheme } from '@ub/ui';
import { mockSendOtp } from '../../lib/onboardingMock';
import { useOnboardingFlowStore } from '../../lib/store/onboardingFlowStore';
import { useOnboardingStore } from '../../lib/store/onboardingStore';

// TODO: point these at the real hosted T&C / Privacy Policy pages.
const TERMS_URL = 'https://ubcrew.in/terms';
const PRIVACY_URL = 'https://ubcrew.in/privacy';

export default function PhoneScreen() {
  const { colors } = useTheme();
  const countryCode = useOnboardingFlowStore((s) => s.countryCode);
  const phone = useOnboardingFlowStore((s) => s.phone);
  const setCountryCode = useOnboardingFlowStore((s) => s.setCountryCode);
  const setPhone = useOnboardingFlowStore((s) => s.setPhone);
  const setRequestId = useOnboardingFlowStore((s) => s.setRequestId);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const [submitting, setSubmitting] = useState(false);

  const canContinue = phone.trim().length >= 7;

  const handleContinue = async () => {
    if (!canContinue || submitting) return;
    setSubmitting(true);
    try {
      const { requestId } = await mockSendOtp();
      setRequestId(requestId);
      router.push('/(onboarding)/otp');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/');
  };

  return (
    <OnboardingLayout
      icon={<Phone size={26} color={colors.ink} />}
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
        label: 'Continue',
        onPress: handleContinue,
        disabled: !canContinue,
        loading: submitting,
      }}
    >
      <PhoneInput
        countryCode={countryCode}
        onChangeCountryCode={setCountryCode}
        value={phone}
        onChangeText={setPhone}
        autoFocus
      />
    </OnboardingLayout>
  );
}
