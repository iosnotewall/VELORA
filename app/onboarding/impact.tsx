import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

export default function ImpactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName, missedDoses } = useAppState();

  const missedPerYear = missedDoses * 52;
  const weeksLost = Math.round(missedPerYear / 7);
  const monthsLost = Math.round(weeksLost / 4.3);

  const line1Anim = useRef(new Animated.Value(0)).current;
  const line2Anim = useRef(new Animated.Value(0)).current;
  const line3Anim = useRef(new Animated.Value(0)).current;
  const line4Anim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  const [counterVal, setCounterVal] = useState(0);
  const counterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = counterAnim.addListener(({ value }) => {
      setCounterVal(Math.round(value));
    });

    Animated.sequence([
      Animated.delay(400),
      Animated.timing(line1Anim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(counterAnim, { toValue: missedPerYear, duration: 1400, useNativeDriver: false }),
        Animated.timing(line2Anim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.delay(600),
      Animated.timing(line3Anim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(600),
      Animated.timing(line4Anim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(400),
      Animated.timing(ctaAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1800);

    return () => counterAnim.removeListener(listener);
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  });

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/shock' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.Text style={[styles.nameLine, fadeSlide(line1Anim)]}>
          <Text style={styles.nameText}>{userName || 'friend'}</Text>
          <Text style={styles.bodyText}>, you'll miss about</Text>
        </Animated.Text>

        <Animated.View style={[styles.statRow, fadeSlide(line2Anim)]}>
          <Text style={styles.bigNumber}>{counterVal} doses</Text>
          <Text style={styles.bodyText}> this year</Text>
        </Animated.View>

        <Animated.Text style={[styles.statLine, fadeSlide(line3Anim)]}>
          that's{' '}
          <Text style={styles.accentOrange}>{weeksLost} weeks</Text>
          {' '}of lost progress
        </Animated.Text>

        <Animated.Text style={[styles.statLine, fadeSlide(line4Anim)]}>
          or{' '}
          <Text style={styles.accentOrange}>{monthsLost} months</Text>
          {' '}your body could've{'\n'}been improving...
        </Animated.Text>

        <Animated.Text style={[styles.ghostLine, fadeSlide(ctaAnim)]}>
          what if you never missed again?
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, { opacity: ctaAnim, paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.ctaRow}
          activeOpacity={0.7}
          testID="impact-continue"
        >
          <Text style={styles.ctaText}>tap to continue</Text>
          <ArrowRight size={20} color={Colors.blue} strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center' as const,
    gap: 20,
  },
  nameLine: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  nameText: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    lineHeight: 42,
  },
  bodyText: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    lineHeight: 42,
  },
  statRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'baseline' as const,
  },
  bigNumber: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.warning,
    lineHeight: 42,
  },
  statLine: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    lineHeight: 42,
  },
  accentOrange: {
    color: Colors.warning,
  },
  ghostLine: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.mediumGray + '80',
    lineHeight: 36,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 28,
  },
  ctaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    gap: 8,
    paddingVertical: 12,
  },
  ctaText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.mediumGray,
  },
});
