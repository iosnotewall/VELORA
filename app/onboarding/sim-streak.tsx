import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { Fonts } from '@/constants/fonts';

const WEEK_DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
const useNative = Platform.OS !== 'web';

const ACCENT = '#D4803A';
const BG_COLOR = '#B8B0A6';
const CARD_BG = 'rgba(255,255,255,0.18)';
const CARD_BORDER = 'rgba(255,255,255,0.28)';
const INACTIVE_CIRCLE = 'rgba(255,255,255,0.15)';
const INACTIVE_TEXT = 'rgba(255,255,255,0.45)';

export default function SimStreakScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lottieRef = useRef<LottieView>(null);

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
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
        Animated.timing(firePulse, { toValue: 1.06, duration: 1200, useNativeDriver: useNative }),
        Animated.timing(firePulse, { toValue: 1, duration: 1200, useNativeDriver: useNative }),
      ])
    ).start();
  }, []);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/loading' as any);
  }, [router]);

  const handlePressIn = useCallback(() => {
    Animated.spring(btnScale, {
      toValue: 0.96,
      useNativeDriver: useNative,
      speed: 50,
      bounciness: 0,
    }).start();
  }, [btnScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(btnScale, {
      toValue: 1,
      useNativeDriver: useNative,
      damping: 18,
      stiffness: 200,
    }).start();
  }, [btnScale]);

  const fadeSlide = (anim: Animated.Value, dist = 16) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
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
          <Animated.View style={[styles.fireGlow, { transform: [{ scale: firePulse }] }]} />
          <Animated.View style={{ opacity: fireAnim, transform: [{ scale: fireScale }] }}>
            {Platform.OS !== 'web' ? (
              <LottieView
                ref={lottieRef}
                source={require('@/assets/animations/Fire.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : (
              <Animated.Text style={[styles.fireEmoji, { transform: [{ scale: firePulse }] }]}>
                🔥
              </Animated.Text>
            )}
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
            {WEEK_DAYS.map((day, i) => {
              const isToday = i === todayDayIndex;
              return (
                <View key={day} style={styles.calDayCol}>
                  <Text style={[styles.calDayLabel, isToday && { color: ACCENT }]}>{day}</Text>
                  <View style={[
                    styles.calDateCircle,
                    isToday && styles.calDateCircleActive,
                  ]}>
                    <Text style={[
                      styles.calDateText,
                      isToday && styles.calDateTextActive,
                    ]}>
                      {weekDates[i]}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, {
        opacity: btnAnim,
        transform: [
          { translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          { scale: btnScale },
        ],
      }]}>
        <TouchableOpacity
          onPress={handleContinue}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.85}
          style={styles.continueBtn}
          testID="streak-continue-button"
        >
          <Text style={styles.continueBtnText}>continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
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
    marginBottom: 12,
    position: 'relative' as const,
    width: 150,
    height: 150,
  },
  fireGlow: {
    position: 'absolute' as const,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(212,128,58,0.12)',
  },
  lottieAnimation: {
    width: 130,
    height: 130,
  },
  fireEmoji: {
    fontSize: 80,
    textAlign: 'center' as const,
  },
  streakNumber: {
    fontFamily: Fonts.heading,
    fontSize: 80,
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 88,
    marginBottom: 2,
    fontWeight: '800' as const,
  },
  streakLabel: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '700' as const,
  },
  streakSub: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 40,
  },
  calendarCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
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
    color: INACTIVE_TEXT,
    textTransform: 'lowercase' as const,
  },
  calDateCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: INACTIVE_CIRCLE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  calDateCircleActive: {
    backgroundColor: ACCENT,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  calDateTextActive: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  calDateText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: INACTIVE_TEXT,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
  continueBtn: {
    height: 56,
    borderRadius: 100,
    backgroundColor: ACCENT,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  continueBtnText: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
});
