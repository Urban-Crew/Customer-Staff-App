import React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { SquircleView as ExpoSquircleView } from 'expo-squircle-view';

export interface SquircleViewProps extends ViewProps {
  cornerSmoothing?: number;
  preserveSmoothing?: boolean;
}

export function SquircleView({
  children,
  style,
  cornerSmoothing = 100,
  preserveSmoothing,
  ...props
}: SquircleViewProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }

  return (
    <ExpoSquircleView
      cornerSmoothing={cornerSmoothing}
      preserveSmoothing={preserveSmoothing}
      style={style}
      {...props}
    >
      {children}
    </ExpoSquircleView>
  );
}
