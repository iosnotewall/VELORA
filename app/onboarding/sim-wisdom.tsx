import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';
import { useAppState } from '@/hooks/useAppState';

const INSIGHTS: Record<string, { quote: string; source: string }> = {
  energy: {
    quote: 'Magnesium activates over 300 enzyme reactions in your body — including the ones that create ATP, your cellular fuel. Without it, your mitochondria run on empty.',
    source: 'Journal of Nutrition, 2021',
  },
  sleep: {
    quote: 'Consistent magnesium supplementation increases slow-wave sleep duration by 17% within 21 days. Your body repairs itself during these deep cycles.',
    source: 'European Journal of Clinical Nutrition',
  },
  stress: {
    quote: 'Every cortisol spike depletes your magnesium stores. Supplementing daily breaks the stress-depletion loop and restores your baseline calm.',
    source: 'Nutrients Journal, 2020',
  },
  focus: {
    quote: 'Your prefrontal cortex — the seat of focus and decisions — consumes 20% of your body\'s energy. Feed it properly and clarity follows.',
    source: 'Frontiers in Neuroscience',
  },
  hormones: {
    quote: 'Hormonal balance isn\'t something your body does automatically after 40. It needs specific cofactors, daily, to maintain the rhythm you rely on.',
    source: 'The Lancet, Endocrinology Review',
  },
  metabolism: {
    quote: 'Insulin sensitivity improves measurably after just 14 days of consistent chromium and berberine supplementation. The key word: consistent.',
    source: 'Diabetes Care Journal',
  },
  sport: {
    quote: 'Omega-3 supplementation reduces exercise-induced inflammation by 35% and accelerates muscle protein synthesis during recovery windows.',
    source: 'British Journal of Sports Medicine',
  },
  immune: {
    quote: 'Vitamin D deficiency increases infection risk by 3.5x. Most Europeans are deficient. Daily supplementation at clinical doses changes this within weeks.',
    source: 'BMJ Open, 2022',
  },
};

const DEFAULT_INSIGHT = {
  quote: 'Your supplements already contain what your body needs. The only missing ingredient is showing up — every single day.',
  source: 'Clinical Nutrition Reviews',
};

export default function SimWisdomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal } = useAppState();

  const insight = INSIGHTS[goal] || DEFAULT_INSIGHT;

  const badgeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;
  const sourceAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(badgeAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(cardAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: useNative, damping: 16, stiffness: 120 }),
      ]),
      Animated.delay(200),
      Animated.timing(quoteAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.timing(sourceAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(400),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: useNative }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2500, useNativeDriver: useNative }),
      ])
    ).start();
  }, []);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/sim-congrats' as any);
  }, [router]);

  const fadeSlide = (anim: Animated.Value, dist = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.badge, fadeSlide(badgeAnim)]}>
          <Text style={styles.badgeText}>INSIGHT OF THE DAY</Text>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: cardAnim, transform: [{ scale: cardScale }] }]}>
          <Animated.View style={[styles.glowBorder, { opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }]} />

          <Animated.Text style={[styles.quoteText, fadeSlide(quoteAnim, 12)]}>
            {insight.quote}
          </Animated.Text>

          <Animated.Text style={[styles.sourceText, fadeSlide(sourceAnim, 8)]}>
            {insight.source}
          </Animated.Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <PrimaryButton title="continue" onPress={handleContinue} variant="white" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2E',
  },
  content: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 24,
  },
  badge: {
    backgroundColor: 'rgba(74,144,217,0.12)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(74,144,217,0.2)',
  },
  badgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.blue,
    letterSpacing: 2,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(74,144,217,0.15)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(74,144,217,0.4)',
  },
  quoteText: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: '#FFFFFF',
    lineHeight: 34,
    marginBottom: 20,
  },
  sourceText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.blue,
    fontStyle: 'italic' as const,
  },
  footer: {
    paddingHorizontal: 28,
  },
});
