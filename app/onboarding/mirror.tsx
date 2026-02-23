import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS, MILESTONES } from '@/constants/content';

export default function MirrorScreen() {
  const router = useRouter();
  const { userName, goal } = useAppState();
  const goalData = GOALS.find(g => g.id === goal);
  const milestones = MILESTONES[goal] || MILESTONES.energy;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const mile1 = useRef(new Animated.Value(0)).current;
  const mile2 = useRef(new Animated.Value(0)).current;
  const mile3 = useRef(new Animated.Value(0)).current;
  const lineProgress = useRef(new Animated.Value(0)).current;

  const TIMELINE = [
    { day: 'Day 7', text: milestones.d7, anim: mile1, accent: Colors.blue },
    { day: 'Day 21', text: milestones.d21, anim: mile2, accent: Colors.deepBlue },
    { day: 'Day 30', text: milestones.d30, anim: mile3, accent: '#1A6BD4' },
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(lineProgress, { toValue: 0.33, duration: 400, useNativeDriver: false }),
        Animated.timing(mile1, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(lineProgress, { toValue: 0.66, duration: 400, useNativeDriver: false }),
        Animated.timing(mile2, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(lineProgress, { toValue: 1, duration: 400, useNativeDriver: false }),
        Animated.timing(mile3, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ]).start();
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  });

  return (
    <OnboardingScreen
      step={6}
      totalSteps={9}
      ctaText="Let's start"
      onCta={() => router.push('/onboarding/day-one' as any)}
    >
      <Animated.View style={[styles.headerWrap, fadeSlide(headerAnim)]}>
        <Text style={styles.headerText}>
          {userName ? `${userName}, here's` : "Here's"} what happens when you stay consistent with {goalData?.label?.toLowerCase() || 'your supplements'}.
        </Text>
      </Animated.View>

      <View style={styles.timeline}>
        <View style={styles.lineTrack}>
          <Animated.View
            style={[
              styles.lineFill,
              {
                height: lineProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {TIMELINE.map((item, index) => (
          <Animated.View key={item.day} style={[styles.milestoneRow, fadeSlide(item.anim)]}>
            <View style={[styles.dot, { backgroundColor: item.accent }]} />
            <View style={[styles.milestoneCard, index === 2 && styles.milestoneCardLast]}>
              <Text style={[styles.milestoneDay, { color: item.accent }]}>{item.day}</Text>
              <Text style={styles.milestoneText}>{item.text}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <Animated.View style={[styles.footerNote, fadeSlide(mile3)]}>
        <Text style={styles.footerNoteText}>
          Supplements aren't magic — they're biology.{'\n'}Consistency is the only variable you control.
        </Text>
      </Animated.View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    marginTop: 8,
    marginBottom: 28,
  },
  headerText: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.navy,
    lineHeight: 34,
  },
  timeline: {
    flex: 1,
    paddingLeft: 16,
    gap: 20,
  },
  lineTrack: {
    position: 'absolute' as const,
    left: 21,
    top: 12,
    bottom: 12,
    width: 2,
    backgroundColor: Colors.lightGray,
    borderRadius: 1,
  },
  lineFill: {
    width: 2,
    backgroundColor: Colors.blue,
    borderRadius: 1,
  },
  milestoneRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  milestoneCardLast: {
    borderWidth: 1.5,
    borderColor: Colors.blue,
    backgroundColor: '#F0F5FF',
  },
  milestoneDay: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  milestoneText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 22,
  },
  footerNote: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  footerNoteText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
