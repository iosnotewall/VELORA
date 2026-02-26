import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WEEK_DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

export default function SimStreakScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const today = new Date();
  const todayDayIndex = today.getDay();

  const fireAnim = useRef(new Animated.Value(0)).current;
  const fireScale = useRef(new Animated.Value(0.2)).current;
  const numberAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;
  const subAnim = useRef(new Animated.Value(0)).current;
  const calAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const firePulse = useRef(new Animated.Value(1)).current;
  const fireGlow = useRef(new Animated.Value(0.3)).current;

  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fireAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
        Animated.spring(fireScale, { toValue: 1, useNativeDriver: useNative, damping: 8, stiffness: 120 }),
      ]),
      Animated.delay(200),
      Animated.timing(numberAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.timing(labelAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.timing(subAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.spring(calAnim, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 120 }),
      Animated.delay(300),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(firePulse, { toValue: 1.08, duration: 1200, useNativeDriver: useNative }),
        Animated.timing(firePulse, { toValue: 1, duration: 1200, useNativeDriver: useNative }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fireGlow, { toValue: 0.6, duration: 1500, useNativeDriver: useNative }),
        Animated.timing(fireGlow, { toValue: 0.3, duration: 1500, useNativeDriver: useNative }),
      ])
    ).start();

    const animateParticle = (p: Animated.Value) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p, { toValue: 1, duration: 1800 + Math.random() * 800, useNativeDriver: useNative }),
          Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: useNative }),
        ])
      ).start();
    };

    setTimeout(() => animateParticle(particle1), 0);
    setTimeout(() => animateParticle(particle2), 600);
    setTimeout(() => animateParticle(particle3), 1200);
  }, []);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/loading' as any);
  }, [router]);

  const fadeSlide = (anim: Animated.Value, dist = 16) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const particleStyle = (p: Animated.Value, offsetX: number) => ({
    opacity: p.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.8, 0.2, 0] }),
    transform: [
      { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }) },
      { translateX: p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, offsetX, offsetX * 1.5] }) },
      { scale: p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1, 0.3] }) },
    ],
  });

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - todayDayIndex);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d.getDate();
  });

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.content}>
        <View style={styles.fireSection}>
          <Animated.View style={[styles.fireGlowOuter, { opacity: fireGlow, transform: [{ scale: firePulse }] }]} />

          <View style={styles.particlesContainer}>
            <Animated.Text style={[styles.particle, particleStyle(particle1, -8)]}>🔥</Animated.Text>
            <Animated.Text style={[styles.particle, particleStyle(particle2, 12)]}>✨</Animated.Text>
            <Animated.Text style={[styles.particle, particleStyle(particle3, -4)]}>🔥</Animated.Text>
          </View>

          <Animated.View style={{ opacity: fireAnim, transform: [{ scale: fireScale }] }}>
            <Animated.Text style={[styles.fireEmoji, { transform: [{ scale: firePulse }] }]}>
              🔥
            </Animated.Text>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.streakNumber, fadeSlide(numberAnim)]}>
          1
        </Animated.Text>

        <Animated.Text style={[styles.streakLabel, fadeSlide(labelAnim)]}>
          day streak
        </Animated.Text>

        <Animated.Text style={[styles.streakSub, fadeSlide(subAnim)]}>
          great start! keep building your{'\n'}daily supplement habit
        </Animated.Text>

        <Animated.View style={[styles.calendarCard, fadeSlide(calAnim)]}>
          <View style={styles.calendarDays}>
            {WEEK_DAYS.map((day, i) => (
              <View key={day} style={styles.calDayCol}>
                <Text style={styles.calDayLabel}>{day}</Text>
                <View style={[
                  styles.calDateCircle,
                  i === todayDayIndex && styles.calDateCircleActive,
                ]}>
                  <Text style={[
                    styles.calDateText,
                    i === todayDayIndex && styles.calDateTextActive,
                  ]}>
                    {weekDates[i]}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
    paddingHorizontal: 32,
  },
  fireSection: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
    position: 'relative' as const,
  },
  fireGlowOuter: {
    position: 'absolute' as const,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,120,30,0.12)',
  },
  particlesContainer: {
    position: 'absolute' as const,
    width: 100,
    height: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  particle: {
    position: 'absolute' as const,
    fontSize: 16,
  },
  fireEmoji: {
    fontSize: 80,
    textAlign: 'center' as const,
  },
  streakNumber: {
    fontFamily: Fonts.heading,
    fontSize: 72,
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 80,
    marginBottom: 4,
  },
  streakLabel: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  streakSub: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 36,
  },
  calendarCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    width: '100%',
  },
  calendarDays: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
  },
  calDayCol: {
    alignItems: 'center' as const,
    gap: 8,
  },
  calDayLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'lowercase' as const,
  },
  calDateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  calDateCircleActive: {
    backgroundColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  calDateText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
  },
  calDateTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
});
