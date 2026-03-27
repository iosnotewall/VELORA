import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BookOpen } from 'lucide-react-native';
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
  const goalColor = Colors.category[goal] || Colors.blue;

  const badgeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;
  const sourceAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

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
          <BookOpen size={13} color={goalColor} strokeWidth={2.5} />
          <Text style={[styles.badgeText, { color: goalColor }]}>INSIGHT OF THE DAY</Text>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: cardAnim, transform: [{ scale: cardScale }] }]}>
          <View style={[styles.cardTopBar, { backgroundColor: goalColor }]} />

          <View style={styles.cardInner}>
            <View style={[styles.quoteBar, { backgroundColor: goalColor + '30' }]} />
            <Animated.Text style={[styles.quoteText, fadeSlide(quoteAnim, 12)]}>
              {insight.quote}
            </Animated.Text>
          </View>

          <View style={styles.sourceRow}>
            <Animated.Text style={[styles.sourceText, { color: goalColor }, fadeSlide(sourceAnim, 8)]}>
              {insight.source}
            </Animated.Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <PrimaryButton title="continue" onPress={handleContinue} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 24,
  },
  badge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: 'rgba(26,31,60,0.04)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(26,31,60,0.04)',
  },
  badgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 2,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden' as const,
    shadowColor: '#8A7A68',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(138,122,104,0.06)',
  },
  cardTopBar: {
    height: 3,
    width: '100%',
  },
  cardInner: {
    flexDirection: 'row' as const,
    padding: 24,
    paddingBottom: 16,
  },
  quoteBar: {
    width: 3,
    borderRadius: 2,
    marginRight: 16,
    minHeight: 40,
  },
  quoteText: {
    flex: 1,
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.navy,
    lineHeight: 30,
  },
  sourceRow: {
    paddingHorizontal: 24,
    paddingBottom: 22,
    paddingLeft: 43,
  },
  sourceText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    fontStyle: 'italic' as const,
  },
  footer: {
    paddingHorizontal: 28,
  },
});
