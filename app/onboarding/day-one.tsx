import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS, SCIENCE_CONTENT } from '@/constants/content';

const CONFETTI_COLORS = ['#1A6BD4', Colors.blue, '#60A5FA', '#4ADE80', '#93C5FD'];

function ConfettiParticle({ delay, color, startX }: { delay: number; color: string; startX: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const velocityX = (Math.random() - 0.5) * 280;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 1200, delay, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        position: 'absolute' as const,
        width: 6,
        height: 6,
        borderRadius: Math.random() > 0.5 ? 3 : 1,
        backgroundColor: color,
        left: startX,
        top: 0,
        opacity: anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, velocityX] }) },
          { translateY: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, -100, 50] }) },
          { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${Math.random() * 720}deg`] }) },
        ],
      }}
    />
  );
}

export default function DayOneScreen() {
  const router = useRouter();
  const { goal, updateState, checkIn } = useAppState();
  const [hasLogged, setHasLogged] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const streakScale = useRef(new Animated.Value(0)).current;
  const scienceAnim = useRef(new Animated.Value(0)).current;

  const goalData = GOALS.find(g => g.id === goal);
  const science = SCIENCE_CONTENT[goal] || SCIENCE_CONTENT.energy;

  const handleLog = useCallback(() => {
    if (hasLogged) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    updateState({ energyLevel: 3 });
    checkIn();
    setHasLogged(true);
    setShowConfetti(true);

    Animated.sequence([
      Animated.spring(celebrationAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 14, stiffness: 120 }),
      Animated.delay(200),
      Animated.spring(streakScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 10, stiffness: 150 }),
      Animated.delay(300),
      Animated.timing(scienceAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    setTimeout(() => setShowConfetti(false), 2500);
  }, [hasLogged, updateState, checkIn, celebrationAnim, streakScale, scienceAnim]);

  return (
    <OnboardingScreen
      step={7}
      totalSteps={9}
      ctaText={hasLogged ? 'Continue' : "I've taken my supplements today"}
      onCta={hasLogged ? () => router.push('/onboarding/loading' as any) : handleLog}
    >
      {!hasLogged ? (
        <View style={styles.preLog}>
          <Text style={styles.headline}>Your journey starts now.</Text>
          <Text style={styles.subline}>
            You've seen the timeline. You know what's possible.{'\n'}Day 1 begins with one action.
          </Text>
          <View style={styles.pillVisual}>
            <Text style={styles.pillEmoji}>💊</Text>
            <Text style={styles.pillLabel}>Tap the button below after you've taken your supplements.</Text>
          </View>
        </View>
      ) : (
        <View style={styles.celebration}>
          {showConfetti && (
            <View style={styles.confettiWrap}>
              {Array.from({ length: 16 }).map((_, i) => (
                <ConfettiParticle
                  key={i}
                  delay={i * 35}
                  color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
                  startX={120 + (Math.random() - 0.5) * 60}
                />
              ))}
            </View>
          )}

          <Animated.View
            style={[
              styles.celebContent,
              {
                opacity: celebrationAnim,
                transform: [{ translateY: celebrationAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              },
            ]}
          >
            <Text style={styles.celebEmoji}>✅</Text>
            <Text style={styles.celebTitle}>Day 1 — done.</Text>
            <Text style={styles.celebSub}>You just did what 82% never do.</Text>
          </Animated.View>

          <Animated.View style={[styles.streakCard, { transform: [{ scale: streakScale }] }]}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakNum}>1</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.scienceBrief,
              {
                opacity: scienceAnim,
                transform: [{ translateY: scienceAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
              },
            ]}
          >
            <Text style={styles.scienceLabel}>{goalData?.label || 'Your goal'}</Text>
            <Text style={styles.scienceText}>
              {science.ingredients.slice(0, 2).join(' + ')} — your body is absorbing them right now.
            </Text>
          </Animated.View>
        </View>
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  preLog: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    lineHeight: 38,
    marginBottom: 12,
  },
  subline: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.mediumGray,
    lineHeight: 24,
    marginBottom: 40,
  },
  pillVisual: {
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 32,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed' as const,
  },
  pillEmoji: {
    fontSize: 48,
  },
  pillLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  celebration: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  confettiWrap: {
    position: 'absolute' as const,
    top: 20,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 10,
  },
  celebContent: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  celebEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  celebTitle: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    marginBottom: 6,
  },
  celebSub: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
  },
  streakCard: {
    backgroundColor: Colors.navy,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  streakFire: {
    fontSize: 32,
    marginBottom: 2,
  },
  streakNum: {
    fontFamily: Fonts.heading,
    fontSize: 44,
    color: Colors.white,
    lineHeight: 48,
  },
  streakLabel: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  scienceBrief: {
    backgroundColor: Colors.blueBg,
    borderRadius: 12,
    padding: 14,
    width: '100%',
  },
  scienceLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.navy,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scienceText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.darkGray,
    lineHeight: 20,
  },
});
