import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Check, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import { GOALS } from '@/constants/content';
import PrimaryButton from '@/components/PrimaryButton';

const GOAL_CONGRATS: Record<string, { title: string; body: string; note: string }> = {
  energy: {
    title: 'energy logged',
    body: 'Your energy data is now being tracked. Over time, you\'ll see exactly how your supplements affect your daily vitality.',
    note: 'consistent tracking reveals patterns\nyou can\'t feel day-to-day.',
  },
  sleep: {
    title: 'sleep logged',
    body: 'Your sleep quality is now being tracked. Within weeks, you\'ll see how your supplements shift your rest patterns.',
    note: 'sleep improvements compound quietly —\ntracking makes them visible.',
  },
  focus: {
    title: 'clarity logged',
    body: 'Your mental clarity is now being tracked. You\'ll start noticing cognitive patterns tied to your supplement consistency.',
    note: 'your brain responds to consistency\nbefore you consciously notice.',
  },
  stress: {
    title: 'calm logged',
    body: 'Your stress levels are now being tracked. Over time, you\'ll see your baseline shift as your nervous system recalibrates.',
    note: 'stress resilience builds invisibly —\ndata makes the shift undeniable.',
  },
  metabolism: {
    title: 'metabolism logged',
    body: 'Your metabolic signals are now being tracked. You\'ll see how your body responds to consistent supplementation over time.',
    note: 'metabolic changes are subtle daily\nbut dramatic over 30 days.',
  },
  hormones: {
    title: 'balance logged',
    body: 'Your hormonal indicators are now being tracked. Patterns across your cycle will reveal what\'s actually changing.',
    note: 'hormonal shifts need weeks to show —\ntracking captures what you\'d miss.',
  },
  sport: {
    title: 'recovery logged',
    body: 'Your recovery and performance data is now being tracked. You\'ll see exactly how supplementation affects your training.',
    note: 'recovery gains compound —\neach day builds on the last.',
  },
  immune: {
    title: 'health logged',
    body: 'Your immune resilience is now being tracked. Consistent data shows how your body\'s defenses strengthen over time.',
    note: 'immune strength builds silently —\ntracking proves it\'s working.',
  },
};

const DEFAULT_CONGRATS = {
  title: 'check-in logged',
  body: 'Your wellness data is now being tracked. Over time, you\'ll see exactly how consistency changes your baseline.',
  note: 'every check-in is saved to your journal\nto track how your body responds.',
};

export default function SimCongratsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName, goal } = useAppState();

  const congratsData = GOAL_CONGRATS[goal] || DEFAULT_CONGRATS;
  const goalData = GOALS.find(g => g.id === goal);
  const goalColor = Colors.category[goal] || Colors.blue;
  const displayName = userName ? userName.split(' ')[0] : '';

  const checkAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.3)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const nameAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const noteAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(checkAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: useNative, damping: 10, stiffness: 150 }),
      ]),
      Animated.delay(300),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.timing(nameAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(cardAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 120 }),
      ]),
      Animated.delay(400),
      Animated.timing(noteAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1, duration: 2000, useNativeDriver: useNative }),
        Animated.timing(ringPulse, { toValue: 0, duration: 2000, useNativeDriver: useNative }),
      ])
    ).start();
  }, []);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/sim-streak' as any);
  }, [router]);

  const fadeSlide = (anim: Animated.Value, dist = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.checkArea}>
            <Animated.View style={[styles.ringOuter, { opacity: ringPulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.35] }), borderColor: goalColor }]} />
            <Animated.View style={[styles.checkCircle, { opacity: checkAnim, transform: [{ scale: checkScale }], backgroundColor: goalColor + '14', borderColor: goalColor + '25' }]}>
              <Check size={32} color={goalColor} strokeWidth={3} />
            </Animated.View>
          </View>

          <Animated.Text style={[styles.title, fadeSlide(titleAnim)]}>
            {congratsData.title}
          </Animated.Text>

          {displayName ? (
            <Animated.Text style={[styles.nameText, fadeSlide(nameAnim)]}>
              nice work, {displayName.toLowerCase()}
            </Animated.Text>
          ) : (
            <Animated.Text style={[styles.nameText, fadeSlide(nameAnim)]}>
              your first check-in is done
            </Animated.Text>
          )}
        </View>

        <View style={styles.middleSection}>
          <Animated.View style={[styles.bodyCard, { opacity: cardAnim, transform: [{ scale: cardScale }] }]}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={[styles.goalDot, { backgroundColor: goalColor }]} />
                  <Text style={styles.cardTitle}>First Check-In</Text>
                </View>
                <Text style={styles.cardDate}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              </View>
              <Text style={styles.bodyText} numberOfLines={2}>
                {congratsData.body}
              </Text>
              <View style={styles.cardFooter}>
                {goalData && (
                  <Text style={[styles.goalTagText, { color: goalColor }]}>{goalData.label}</Text>
                )}
                <ArrowRight size={18} color={goalColor} />
              </View>
            </View>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.noteText, fadeSlide(noteAnim)]}>
          {congratsData.note}
        </Animated.Text>
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
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center' as const,
    paddingTop: 32,
    marginBottom: 36,
  },
  checkArea: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 24,
    width: 88,
    height: 88,
  },
  ringOuter: {
    position: 'absolute' as const,
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 34,
    color: Colors.navy,
    textAlign: 'center' as const,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  nameText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 17,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  bodyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden' as const,
    shadowColor: '#8A7A68',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(138,122,104,0.06)',
  },
  cardContent: {
    padding: 22,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  cardDate: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.mediumGray,
  },
  goalDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  goalTagText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  bodyText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 23,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  noteText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    paddingTop: 8,
  },
});
