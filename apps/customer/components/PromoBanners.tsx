import { useEffect, useMemo, useState } from 'react';
import { router, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  SlideInLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { spacing, Text } from '@ub/ui';
import type { PromoBanner } from '@ub/shared-types';

export interface PromoBannersProps {
  banners: PromoBanner[];
  /** How long each banner stays up before auto-advancing to the next, in ms. */
  intervalMs?: number;
}

const IMAGE_SIZE = 84;

/**
 * One banner at a time, no card/background — sits directly on the header's
 * own color. With more than one banner it auto-advances, with each piece
 * animating independently: the image slides out right / in from the left,
 * the title + description fade while sliding up, the CTA fades while
 * sliding down. A single banner just sits there, no animation at all.
 */
export function PromoBanners({ banners, intervalMs = 4500 }: PromoBannersProps) {
  const sorted = useMemo(
    () => [...banners].sort((a, b) => a.displayOrder - b.displayOrder),
    [banners],
  );
  const [index, setIndex] = useState(0);
  const animate = sorted.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [sorted.length]);

  useEffect(() => {
    if (!animate) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % sorted.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [animate, sorted.length, intervalMs]);

  if (!sorted.length) return null;

  const banner = sorted[index % sorted.length];

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Animated.View
            key={`text-${banner.id}`}
            entering={animate ? FadeInUp.duration(600) : undefined}
            exiting={animate ? FadeOutUp.duration(450) : undefined}
          >
            <Text variant="heading" fontWeight="700" numberOfLines={2} style={styles.title}>
              {banner.title}
            </Text>
            <Text numberOfLines={2} style={styles.subtitle}>
              {banner.subtitle}
            </Text>
          </Animated.View>

          {banner.ctaShown ? (
            <Animated.View
              key={`cta-${banner.id}`}
              entering={animate ? FadeInDown.duration(600) : undefined}
              exiting={animate ? FadeOutDown.duration(450) : undefined}
            >
              <Pressable
                style={styles.cta}
                hitSlop={8}
                onPress={() => router.push(banner.ctaRoute as Href)}
              >
                <Text fontWeight="700" style={styles.ctaLabel}>
                  {banner.ctaTitle}
                </Text>
                <ArrowRight size={16} color="#fff" />
              </Pressable>
            </Animated.View>
          ) : null}
        </View>

        {banner.imageUrl ? (
          <Animated.View
            key={`image-${banner.id}`}
            entering={animate ? SlideInLeft.duration(650) : undefined}
            exiting={animate ? SlideOutRight.duration(650) : undefined}
            style={styles.imageWrap}
          >
            <Image source={{ uri: banner.imageUrl }} style={styles.image} contentFit="contain" />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 104,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  // Text is top-aligned and sized to its own content (so a 2-line title
  // never gets clipped) — only the image is pinned to the bottom of the
  // row, standing at the bottom edge of the promo area.
  textCol: {
    flex: 1,
    alignSelf: 'flex-start',
    gap: 4,
    paddingRight: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: { fontSize: 17, color: '#fff' },
  subtitle: { fontSize: 13, lineHeight: 17, color: 'rgba(255,255,255,0.8)' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  ctaLabel: { fontSize: 14, color: '#fff' },
  imageWrap: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    alignSelf: 'flex-end',
  },
  image: { width: '100%', height: '100%' },
});
