import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

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
        Animated.timing(firePulse, { toValue: 1.06, duration: 1200, useNativeDriver: useNative }),
        Animated.timing(firePulse, { toValue: 1, duration: 1200, useNativeDriver: useNative }),
      ])
    ).start();
  }, []);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/loading' as any);
  }, [router]);

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

  const accentColor = '#D4803A';

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.content}>
        <View style={styles.fireSection}>
          <Animated.View style={[styles.fireGlow, { transform: [{ scale: firePulse }] }]} />
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
            {WEEK_DAYS.map((day, i) => {
              const isToday = i === todayDayIndex;
              return (
                <View key={day} style={styles.calDayCol}>
                  <Text style={[styles.calDayLabel, isToday && { color: accentColor }]}>{day}</Text>
                  <View style={[
                    styles.calDateCircle,
                    isToday && { backgroundColor: accentColor },
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
    paddingHorizontal: 32,
  },
  fireSection: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
    position: 'relative' as const,
  },
  fireGlow: {
    position: 'absolute' as const,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(212,128,58,0.08)',
  },
  fireEmoji: {
    fontSize: 72,
    textAlign: 'center' as const,
  },
  streakNumber: {
    fontFamily: Fonts.heading,
    fontSize: 72,
    color: Colors.navy,
    letterSpacing: -2,
    lineHeight: 80,
    marginBottom: 4,
  },
  streakLabel: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.navy,
    marginBottom: 10,
  },
  streakSub: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 36,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(138,122,104,0.08)',
    width: '100%',
    shadowColor: '#8A7A68',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
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
    color: 'rgba(26,31,60,0.3)',
    textTransform: 'lowercase' as const,
  },
  calDateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(26,31,60,0.04)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  calDateTextActive: {
    color: '#FFFFFF',
  },
  calDateText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: 'rgba(26,31,60,0.3)',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
});
