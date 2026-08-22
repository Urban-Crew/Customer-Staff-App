import { useState } from 'react';
import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { Checkbox, Input, OnboardingLayout, useTheme } from '@ub/ui';
import { mockAddEmail } from '../../lib/onboardingMock';
import { useOnboardingFlowStore } from '../../lib/store/onboardingFlowStore';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailScreen() {
  const { colors } = useTheme();
  const email = useOnboardingFlowStore((s) => s.email);
  const setEmail = useOnboardingFlowStore((s) => s.setEmail);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canContinue = EMAIL_PATTERN.test(email.trim());

  const handleContinue = async () => {
    if (!canContinue || submitting) return;
    setSubmitting(true);
    try {
      await mockAddEmail();
      router.push('/(onboarding)/location-choice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => router.push('/(onboarding)/location-choice');

  return (
    <OnboardingLayout
      icon={<Mail size={26} color={colors.ink} />}
      title="Add your email"
      description="Please provide your email address for account-related updates and communication."
      onSkip={handleSkip}
      primaryAction={{
        label: 'Add email',
        onPress: handleContinue,
        disabled: !canContinue,
        loading: submitting,
      }}
    >
      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="Enter Email Id"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        autoFocus
      />
      <Checkbox
        checked={marketingOptIn}
        onChange={setMarketingOptIn}
        label="Send me promotional messages and emails with deal and discounts"
      />
    </OnboardingLayout>
  );
}
