import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Bell, ClipboardList, BarChart3, ArrowRight, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import { GOALS, GOAL_METRICS, DEFAULT_METRICS, NOTIFICATION_EXAMPLES } from '@/constants/content';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GOAL_WALKTHROUGH: Record<string, {
  notifText: string;
  trackingIntro: string;
  metrics: string[];
  snapshotText: string;
}> = {
  energy: {
    notifText: "your energy levels and vitality",
    trackingIntro: "We'll ask about your morning alertness,\nenergy dips, and caffeine patterns.",
    metrics: ['Wake-up energy', 'Mitochondrial dip', 'Sustained output', 'Caffeine dependency'],
    snapshotText: "your energy trajectory over time",
  },
  stress: {
    notifText: "your stress, anxiety and sleep",
    trackingIntro: "We'll ask about baseline tension,\nstress recovery, sleep onset, and emotional regulation.",
    metrics: ['Baseline tension', 'Trigger response', 'Sleep onset', 'Emotional regulation'],
    snapshotText: "your stress resilience over time",
  },
  pain: {
    notifText: "your pain and inflammation levels",
    trackingIntro: "We'll ask about pain intensity,\njoint stiffness, mobility, and inflammation signs.",
    metrics: ['Pain intensity', 'Joint stiffness', 'Mobility', 'Inflammation signs'],
    snapshotText: "your pain and mobility over time",
  },
  menopause: {
    notifText: "your menopause comfort",
    trackingIntro: "We'll ask about hot flashes,\nmood stability, night sweats, and bone comfort.",
    metrics: ['Hot flashes', 'Mood stability', 'Night sweats & sleep', 'Bone & joint comfort'],
    snapshotText: "your menopause comfort over time",
  },
  metabolism: {
    notifText: "your metabolic signals",
    trackingIntro: "We'll ask about post-meal energy,\nhunger patterns, and cravings.",
    metrics: ['Post-meal glucose', 'Hunger signals', 'Sugar cravings', 'GI comfort'],
    snapshotText: "your metabolic patterns over time",
  },
  digestion: {
    notifText: "your digestive health",
    trackingIntro: "We'll ask about bloating,\nregularity, gut comfort, and food tolerance.",
    metrics: ['Bloating', 'Regularity', 'Gut comfort', 'Food tolerance'],
    snapshotText: "your digestive health over time",
  },
  focus: {
    notifText: "your mental clarity and focus",
    trackingIntro: "We'll ask about deep work capacity,\ntask switching, and afternoon cognition.",
    metrics: ['Deep work capacity', 'Task switching', 'Word retrieval', 'PM clarity'],
    snapshotText: "your cognitive performance over time",
  },
  cycle: {
    notifText: "your hormonal balance and cycle",
    trackingIntro: "We'll ask about mood shifts,\ncycle symptoms, and skin clarity.",
    metrics: ['Mood volatility', 'Cycle symptoms', 'Water retention', 'Skin & breakouts'],
    snapshotText: "your hormonal balance over cycles",
  },
  fertility: {
    notifText: "your fertility and pregnancy journey",
    trackingIntro: "We'll ask about supplement timing,\nenergy, stress levels, and body signals.",
    metrics: ['Supplement timing', 'Overall energy', 'Stress level', 'Body signals'],
    snapshotText: "your fertility preparation over time",
  },
  antiaging: {
    notifText: "your anti-aging and vitality",
    trackingIntro: "We'll ask about skin quality,\nvitality, recovery speed, and joint flexibility.",
    metrics: ['Skin quality', 'Vitality', 'Recovery speed', 'Joint flexibility'],
    snapshotText: "your vitality and skin health over time",
  },
};

const DEFAULT_WALKTHROUGH = {
  notifText: "your daily wellness",
  trackingIntro: "We'll ask a few quick questions\nabout how your body feels today.",
  metrics: ['Wake-up energy', 'Sleep quality', 'PM clarity', 'Body signals'],
  snapshotText: "your wellness patterns over time",
};

export default function WalkthroughScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, userName } = useAppState();

  const goalData = GOALS.find(g => g.id === goal);
  const goalColor = Colors.category[goal] || Colors.blue;
  const wt = GOAL_WALKTHROUGH[goal] || DEFAULT_WALKTHROUGH;
  const notifExample = NOTIFICATION_EXAMPLES[goal] || "Time to check in. Your body is listening.";
  const displayName = userName ? userName.split(' ')[0] : '';

  const [phase, setPhase] = useState(0);
  const useNative = Platform.OS !== 'web';

  const phase0Line1 = useRef(new Animated.Value(0)).current;
  const phase0Line2 = useRef(new Animated.Value(0)).current;
  const phase0Notif = useRef(new Animated.Value(0)).current;
  const phase0NotifSlide = useRef(new Animated.Value(-80)).current;
  const phase0Line3 = useRef(new Animated.Value(0)).current;
  const phase0Tap = useRef(new Animated.Value(0)).current;

  const phase1Line1 = useRef(new Animated.Value(0)).current;
  const phase1Line2 = useRef(new Animated.Value(0)).current;
  const phase1Metrics = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const phase1Tap = useRef(new Animated.Value(0)).current;

  const phase2Line1 = useRef(new Animated.Value(0)).current;
  const phase2Line2 = useRef(new Animated.Value(0)).current;
  const phase2Line3 = useRef(new Animated.Value(0)).current;
  const phase2Tap = useRef(new Animated.Value(0)).current;

  const phase3Line1 = useRef(new Animated.Value(0)).current;
  const phase3Line2 = useRef(new Animated.Value(0)).current;
  const phase3Btn = useRef(new Animated.Value(0)).current;

  const crossfadeOut = useRef(new Animated.Value(1)).current;
  const crossfadeIn = useRef(new Animated.Value(1)).current;

  const tapPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tapPulse, { toValue: 1, duration: 1500, useNativeDriver: useNative }),
        Animated.timing(tapPulse, { toValue: 0, duration: 1500, useNativeDriver: useNative }),
      ])
    ).start();
  }, []);

  const runPhase0 = useCallback(() => {
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(phase0Line1, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(600),
      Animated.timing(phase0Line2, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(phase0Notif, { toValue: 1, duration: 400, useNativeDriver: useNative }),
        Animated.spring(phase0NotifSlide, { toValue: 0, useNativeDriver: useNative, damping: 18, stiffness: 200 }),
      ]),
      Animated.delay(200),
      Animated.timing(phase0Line3, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(600),
      Animated.timing(phase0Tap, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();

    const hapticDelay = 400 + 600 + 600 + 500 + 800;
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, hapticDelay);
  }, []);

  const runPhase1 = useCallback(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(phase1Line1, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(400),
      Animated.timing(phase1Line2, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(300),
      ...phase1Metrics.map((anim, i) =>
        Animated.sequence([
          Animated.delay(i === 0 ? 0 : 120),
          Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: useNative }),
        ])
      ),
      Animated.delay(600),
      Animated.timing(phase1Tap, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 300 + 600 + 400 + 500 + 300);
  }, []);

  const runPhase2 = useCallback(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(phase2Line1, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(500),
      Animated.timing(phase2Line2, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(600),
      Animated.timing(phase2Line3, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(600),
      Animated.timing(phase2Tap, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();
  }, []);

  const runPhase3 = useCallback(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(phase3Line1, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(400),
      Animated.timing(phase3Line2, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(600),
      Animated.timing(phase3Btn, { toValue: 1, duration: 500, useNativeDriver: useNative }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 300 + 600);
  }, []);

  useEffect(() => {
    runPhase0();
  }, []);

  const transitionToPhase = useCallback((nextPhase: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.timing(crossfadeOut, {
      toValue: 0,
      duration: 250,
      useNativeDriver: useNative,
    }).start(() => {
      setPhase(nextPhase);
      crossfadeIn.setValue(0);

      Animated.timing(crossfadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: useNative,
      }).start(() => {
        crossfadeOut.setValue(1);
        if (nextPhase === 1) runPhase1();
        else if (nextPhase === 2) runPhase2();
        else if (nextPhase === 3) runPhase3();
      });
    });
  }, []);

  const handleTap = useCallback(() => {
    if (phase < 3) {
      transitionToPhase(phase + 1);
    }
  }, [phase, transitionToPhase]);

  const handleStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/sim-checkin' as any);
  }, [router]);

  const fadeSlide = (anim: Animated.Value, dist = 24) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const currentOpacity = phase < 3
    ? Animated.multiply(crossfadeOut, crossfadeIn)
    : crossfadeIn;

  const progressDots = (
    <View style={styles.progressDots}>
      {[0, 1, 2, 3].map(i => (
        <View
          key={i}
          style={[
            styles.dot,
            i === phase && { backgroundColor: goalColor, width: 20 },
            i < phase && { backgroundColor: 'rgba(255,255,255,0.4)' },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.glowTop} />
      <View style={[styles.glowAccent, { backgroundColor: goalColor + '08' }]} />

      <View style={styles.header}>
        {progressDots}
      </View>

      <TouchableOpacity
        activeOpacity={1}
        style={styles.contentTouchable}
        onPress={phase < 3 ? handleTap : undefined}
        disabled={phase >= 3}
      >
        <Animated.View style={[styles.content, { opacity: currentOpacity }]}>
          {phase === 0 && (
            <View style={styles.phaseContent}>
              <Animated.Text style={[styles.phaseTitle, fadeSlide(phase0Line1)]}>
                Every day, at the{'\n'}right moment
              </Animated.Text>

              <Animated.Text style={[styles.phaseBody, fadeSlide(phase0Line2)]}>
                Volera will send you a gentle nudge{'\n'}to check in on {wt.notifText}.
              </Animated.Text>

              <Animated.View style={[styles.notifCard, {
                opacity: phase0Notif,
                transform: [{ translateY: phase0NotifSlide }],
              }]}>
                <View style={styles.notifHeader}>
                  <View style={[styles.notifIcon, { backgroundColor: goalColor + '20' }]}>
                    <Bell size={14} color={goalColor} strokeWidth={2.5} />
                  </View>
                  <View style={styles.notifHeaderText}>
                    <Text style={styles.notifAppName}>Volera</Text>
                    <Text style={styles.notifTime}>now</Text>
                  </View>
                </View>
                <Text style={styles.notifBody}>{notifExample}</Text>
              </Animated.View>

              <Animated.Text style={[styles.phaseSubtle, fadeSlide(phase0Line3)]}>
                Smart timing. No spam.{'\n'}Just the right nudge when it matters.
              </Animated.Text>

              <Animated.View style={[styles.tapHint, {
                opacity: Animated.multiply(phase0Tap, tapPulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] })),
              }]}>
                <Text style={styles.tapText}>tap to continue</Text>
                <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
              </Animated.View>
            </View>
          )}

          {phase === 1 && (
            <View style={styles.phaseContent}>
              <Animated.View style={[styles.phaseIconRow, fadeSlide(phase1Line1)]}>
                <View style={[styles.phaseIconCircle, { backgroundColor: goalColor + '15', borderColor: goalColor + '25' }]}>
                  <ClipboardList size={22} color={goalColor} strokeWidth={2} />
                </View>
              </Animated.View>

              <Animated.Text style={[styles.phaseTitle, fadeSlide(phase1Line1)]}>
                A few quick{'\n'}questions daily
              </Animated.Text>

              <Animated.Text style={[styles.phaseBody, fadeSlide(phase1Line2)]}>
                {wt.trackingIntro}
              </Animated.Text>

              <View style={styles.metricsContainer}>
                {wt.metrics.map((metric, i) => (
                  <Animated.View
                    key={metric}
                    style={[styles.metricRow, fadeSlide(phase1Metrics[i], 16)]}
                  >
                    <View style={[styles.metricDot, { backgroundColor: goalColor }]} />
                    <Text style={styles.metricText}>{metric}</Text>
                  </Animated.View>
                ))}
              </View>

              <Animated.View style={[styles.tapHint, {
                opacity: Animated.multiply(phase1Tap, tapPulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] })),
              }]}>
                <Text style={styles.tapText}>tap to continue</Text>
                <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
              </Animated.View>
            </View>
          )}

          {phase === 2 && (
            <View style={styles.phaseContent}>
              <Animated.View style={[styles.phaseIconRow, fadeSlide(phase2Line1)]}>
                <View style={[styles.phaseIconCircle, { backgroundColor: goalColor + '15', borderColor: goalColor + '25' }]}>
                  <BarChart3 size={22} color={goalColor} strokeWidth={2} />
                </View>
              </Animated.View>

              <Animated.Text style={[styles.phaseTitle, fadeSlide(phase2Line1)]}>
                Your daily{'\n'}snapshot
              </Animated.Text>

              <Animated.Text style={[styles.phaseBody, fadeSlide(phase2Line2)]}>
                Each check-in builds a picture of{'\n'}{wt.snapshotText}.
              </Animated.Text>

              <Animated.Text style={[styles.phaseSubtle, fadeSlide(phase2Line3)]}>
                Over time, patterns emerge that{'\n'}you can't feel day-to-day.{'\n\n'}
                <Text style={[styles.phaseSubtleAccent, { color: goalColor }]}>
                  This is how you prove it's working.
                </Text>
              </Animated.Text>

              <Animated.View style={[styles.tapHint, {
                opacity: Animated.multiply(phase2Tap, tapPulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] })),
              }]}>
                <Text style={styles.tapText}>tap to continue</Text>
                <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
              </Animated.View>
            </View>
          )}

          {phase === 3 && (
            <View style={styles.phaseContent}>
              <Animated.Text style={[styles.phaseTitleLarge, fadeSlide(phase3Line1)]}>
                {displayName ? `${displayName}, let's` : "Let's"}{'\n'}try it now.
              </Animated.Text>

              <Animated.Text style={[styles.phaseBody, fadeSlide(phase3Line2)]}>
                Your first check-in takes 30 seconds.{'\n'}
                {goalData ? `We'll track what matters for ${goalData.feeling}.` : "We'll track what matters for your health."}
              </Animated.Text>

              <Animated.View style={[styles.ctaContainer, fadeSlide(phase3Btn, 30)]}>
                <TouchableOpacity
                  style={[styles.ctaButton, { backgroundColor: goalColor }]}
                  onPress={handleStart}
                  activeOpacity={0.85}
                >
                  <Text style={styles.ctaText}>Start check-in</Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {phase < 3 && (
          <TouchableOpacity onPress={() => transitionToPhase(3)} activeOpacity={0.7}>
            <Text style={styles.skipText}>skip intro</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2E',
  },
  glowTop: {
    position: 'absolute' as const,
    top: -120,
    left: SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.6,
    height: 300,
    borderRadius: 200,
    backgroundColor: 'rgba(74,144,217,0.06)',
  },
  glowAccent: {
    position: 'absolute' as const,
    bottom: -80,
    right: -40,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    alignItems: 'center' as const,
  },
  progressDots: {
    flexDirection: 'row' as const,
    gap: 8,
    alignItems: 'center' as const,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  contentTouchable: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center' as const,
  },
  phaseContent: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  phaseIconRow: {
    marginBottom: 24,
  },
  phaseIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  },
  phaseTitle: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: '#F1F5F9',
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  phaseTitleLarge: {
    fontFamily: Fonts.heading,
    fontSize: 38,
    color: '#FFFFFF',
    lineHeight: 48,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  phaseBody: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 17,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 26,
    marginBottom: 28,
  },
  phaseSubtle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 24,
    marginTop: 4,
  },
  phaseSubtleAccent: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 15,
  },
  notifCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 28,
  },
  notifHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
    gap: 10,
  },
  notifIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  notifHeaderText: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  notifAppName: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.2,
  },
  notifTime: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
  notifBody: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  metricsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  metricRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
  },
  tapHint: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
    marginTop: 40,
  },
  tapText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  ctaContainer: {
    marginTop: 16,
  },
  ctaButton: {
    height: 58,
    borderRadius: 100,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 12,
    alignItems: 'center' as const,
  },
  skipText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.25)',
  },
});
