import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

const GAUGE_SIZE = 220;
const STROKE_WIDTH = 14;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ImpactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName, missedDoses } = useAppState();

  const daysPerWeek = missedDoses ?? 3;
  const consistencyPct = Math.round((daysPerWeek / 7) * 100);
  const gap = 100 - consistencyPct;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const gaugeAnim = useRef(new Animated.Value(0)).current;
  const pctAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;
  const hookAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const [displayPct, setDisplayPct] = useState(0);
  const [strokeDashoffset, setStrokeDashoffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const pctListener = pctAnim.addListener(({ value }) => {
      setDisplayPct(Math.round(value));
    });

    const gaugeListener = gaugeAnim.addListener(({ value }) => {
      const offset = CIRCUMFERENCE - (CIRCUMFERENCE * value);
      setStrokeDashoffset(offset);
    });

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(gaugeAnim, { toValue: consistencyPct / 100, duration: 1400, useNativeDriver: false }),
        Animated.timing(pctAnim, { toValue: consistencyPct, duration: 1400, useNativeDriver: false }),
      ]),
      Animated.timing(labelAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(300),
      Animated.timing(insightAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(200),
      Animated.timing(hookAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(200),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1800);

    return () => {
      pctAnim.removeListener(pctListener);
      gaugeAnim.removeListener(gaugeListener);
    };
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  });

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/shock' as any);
  }, [router]);

  const gaugeColor = consistencyPct >= 80 ? '#3AAF6C' : consistencyPct >= 50 ? '#E8A838' : Colors.warning;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.content}>
        <Animated.View style={fadeSlide(headerAnim)}>
          <Text style={styles.eyebrow}>your reality check</Text>
          <Text style={styles.headline}>
            {userName ? `${userName}, your` : 'Your'} supplements are only working at
          </Text>
        </Animated.View>

        <View style={styles.gaugeSection}>
          <View style={styles.gaugeContainer}>
            <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} style={styles.gaugeSvg}>
              <Circle
                cx={GAUGE_SIZE / 2}
                cy={GAUGE_SIZE / 2}
                r={RADIUS}
                stroke={Colors.lightGray}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={GAUGE_SIZE / 2}
                cy={GAUGE_SIZE / 2}
                r={RADIUS}
                stroke={gaugeColor}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={`${CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${GAUGE_SIZE / 2}, ${GAUGE_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.gaugeCenter}>
              <Text style={[styles.pctNumber, { color: gaugeColor }]}>{displayPct}%</Text>
              <Animated.Text style={[styles.pctLabel, fadeSlide(labelAnim)]}>
                consistency
              </Animated.Text>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.insightCard, fadeSlide(insightAnim)]}>
          <View style={[styles.insightAccent, { backgroundColor: gaugeColor }]} />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Here's the problem</Text>
            <Text style={styles.insightBody}>
              At {consistencyPct}% consistency, your body never builds up enough of what it needs.{' '}
              <Text style={styles.insightBold}>
                You're paying for 100% but only getting {consistencyPct}% of the results.
              </Text>
            </Text>
            {gap > 20 && (
              <Text style={styles.insightDetail}>
                Research shows supplements need 90%+ consistency to deliver real, noticeable results.
              </Text>
            )}
          </View>
        </Animated.View>

        <Animated.View style={[styles.hookWrap, fadeSlide(hookAnim)]}>
          <Text style={styles.hookText}>What if you never missed again?</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="Show me how" onPress={handleContinue} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.mediumGray,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.8,
    marginBottom: 10,
    marginTop: 12,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.navy,
    lineHeight: 32,
  },
  gaugeSection: {
    alignItems: 'center' as const,
    marginTop: 32,
    marginBottom: 28,
  },
  gaugeContainer: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  gaugeSvg: {
    position: 'absolute' as const,
  },
  gaugeCenter: {
    alignItems: 'center' as const,
  },
  pctNumber: {
    fontFamily: Fonts.heading,
    fontSize: 56,
    letterSpacing: -2,
    lineHeight: 62,
  },
  pctLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  insightCard: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
    marginBottom: 24,
  },
  insightAccent: {
    width: 4,
  },
  insightContent: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 8,
  },
  insightTitle: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  insightBody: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 21,
  },
  insightBold: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: Colors.navy,
  },
  insightDetail: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    lineHeight: 19,
    fontStyle: 'italic' as const,
  },
  hookWrap: {
    paddingHorizontal: 4,
  },
  hookText: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.blue,
    textAlign: 'center' as const,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
