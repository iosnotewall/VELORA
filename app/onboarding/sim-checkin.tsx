import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOAL_METRICS, DEFAULT_METRICS, GOALS } from '@/constants/content';
import type { GoalMetric } from '@/constants/content';
import { useAppState } from '@/hooks/useAppState';
import PrimaryButton from '@/components/PrimaryButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCORE_OPTIONS = [1, 2, 3, 4, 5];

const SCORE_EMOJIS: Record<number, string> = {
  1: '😣',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

const BG_PALETTES: Record<string, string> = {
  energy: '#1C1A0F',
  sleep: '#0F1320',
  focus: '#14101E',
  stress: '#0C1610',
  metabolism: '#1C1A0F',
  hormones: '#1C1018',
  sport: '#0C1610',
  immune: '#0C1220',
};

export default function SimCheckinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, userName } = useAppState();

  const metrics = GOAL_METRICS[goal] || DEFAULT_METRICS;
  const goalData = GOALS.find(g => g.id === goal);
  const goalColor = Colors.category[goal] || Colors.blue;
  const bgColor = BG_PALETTES[goal] || '#0F1320';

  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});

  const greetAnim = useRef(new Animated.Value(0)).current;
  const questionAnim = useRef(new Animated.Value(0)).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;
  const scoresAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(1)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;
  const summaryAnim = useRef(new Animated.Value(0)).current;

  const scoreButtonAnims = useRef(SCORE_OPTIONS.map(() => new Animated.Value(0))).current;
  const scoreScaleAnims = useRef(SCORE_OPTIONS.map(() => new Animated.Value(1))).current;

  const currentMetric = metrics[currentStep] as GoalMetric | undefined;
  const currentScore = currentMetric ? (scores[currentMetric.id] ?? 0) : 0;
  const allDone = metrics.every(m => (scores[m.id] ?? 0) > 0);
  const isLastStep = currentStep >= metrics.length;

  const displayName = userName ? userName.split(' ')[0].toLowerCase() : '';

  const animateEntrance = useCallback((isFirst: boolean) => {
    const useNative = Platform.OS !== 'web';

    questionAnim.setValue(0);
    emojiAnim.setValue(0);
    scoresAnim.setValue(0);
    labelAnim.setValue(0);
    emojiScale.setValue(1);
    scoreButtonAnims.forEach(a => a.setValue(0));
    scoreScaleAnims.forEach(a => a.setValue(1));

    const sequence = isFirst
      ? [
          Animated.delay(300),
          Animated.timing(greetAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
          Animated.delay(200),
          Animated.timing(questionAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
          Animated.delay(150),
          Animated.timing(emojiAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
          Animated.delay(150),
          Animated.timing(scoresAnim, { toValue: 1, duration: 350, useNativeDriver: useNative }),
          Animated.delay(80),
          ...SCORE_OPTIONS.map((_, i) =>
            Animated.spring(scoreButtonAnims[i], { toValue: 1, useNativeDriver: useNative, damping: 14, stiffness: 180, delay: i * 50 })
          ),
        ]
      : [
          Animated.delay(100),
          Animated.timing(questionAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
          Animated.delay(100),
          Animated.timing(emojiAnim, { toValue: 1, duration: 350, useNativeDriver: useNative }),
          Animated.delay(100),
          Animated.timing(scoresAnim, { toValue: 1, duration: 300, useNativeDriver: useNative }),
          Animated.delay(60),
          ...SCORE_OPTIONS.map((_, i) =>
            Animated.spring(scoreButtonAnims[i], { toValue: 1, useNativeDriver: useNative, damping: 14, stiffness: 180, delay: i * 40 })
          ),
        ];

    Animated.sequence(sequence).start();
  }, [greetAnim, questionAnim, emojiAnim, scoresAnim, labelAnim, emojiScale, scoreButtonAnims, scoreScaleAnims]);

  useEffect(() => {
    animateEntrance(true);
  }, []);

  const animateProgress = useCallback((step: number) => {
    const useNative = Platform.OS !== 'web';
    Animated.timing(progressAnim, {
      toValue: (step + 1) / metrics.length,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, metrics.length]);

  const handleSelectScore = useCallback((score: number) => {
    if (!currentMetric) return;
    const useNative = Platform.OS !== 'web';

    setScores(prev => ({ ...prev, [currentMetric.id]: score }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const idx = score - 1;
    Animated.parallel([
      Animated.sequence([
        Animated.timing(emojiScale, { toValue: 1.25, duration: 100, useNativeDriver: useNative }),
        Animated.spring(emojiScale, { toValue: 1, useNativeDriver: useNative, damping: 12, stiffness: 200 }),
      ]),
      Animated.timing(labelAnim, { toValue: 1, duration: 200, useNativeDriver: useNative }),
      Animated.sequence([
        Animated.timing(scoreScaleAnims[idx], { toValue: 1.18, duration: 80, useNativeDriver: useNative }),
        Animated.spring(scoreScaleAnims[idx], { toValue: 1, useNativeDriver: useNative, damping: 12, stiffness: 200 }),
      ]),
    ]).start();

    animateProgress(currentStep);

    setTimeout(() => {
      if (currentStep < metrics.length - 1) {
        setCurrentStep(prev => prev + 1);
        animateEntrance(false);
      } else {
        setCurrentStep(metrics.length);
        const sUseNative = Platform.OS !== 'web';
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(summaryAnim, { toValue: 1, duration: 500, useNativeDriver: sUseNative }),
          Animated.delay(200),
          Animated.spring(btnAnim, { toValue: 1, useNativeDriver: sUseNative, damping: 18, stiffness: 140 }),
        ]).start();
      }
    }, 600);
  }, [currentMetric, currentStep, metrics, emojiScale, labelAnim, scoreScaleAnims, animateProgress, animateEntrance, summaryAnim, btnAnim]);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/sim-congrats' as any);
  }, [router]);

  const fadeSlide = (anim: Animated.Value, dist = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Animated.View style={[styles.progressTrack, fadeSlide(greetAnim, 10)]}>
          <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: goalColor }]} />
        </Animated.View>

        <Animated.View style={[styles.stepIndicator, fadeSlide(greetAnim, 10)]}>
          <Text style={styles.stepText}>
            {isLastStep ? 'summary' : `${currentStep + 1} of ${metrics.length}`}
          </Text>
          {goalData && (
            <View style={[styles.goalPill, { backgroundColor: goalColor + '20' }]}>
              <View style={[styles.goalDot, { backgroundColor: goalColor }]} />
              <Text style={[styles.goalPillText, { color: goalColor }]}>{goalData.label}</Text>
            </View>
          )}
        </Animated.View>
      </View>

      {!isLastStep && currentMetric ? (
        <View style={styles.questionArea}>
          <Animated.View style={[styles.badge, fadeSlide(greetAnim)]}>
            <Text style={styles.badgeText}>DAILY CHECK-IN</Text>
          </Animated.View>

          {displayName && currentStep === 0 ? (
            <Animated.Text style={[styles.greeting, fadeSlide(greetAnim)]}>
              hey {displayName} 👋
            </Animated.Text>
          ) : null}

          <Animated.Text style={[styles.question, fadeSlide(questionAnim)]}>
            {currentMetric.question}
          </Animated.Text>

          <Animated.View style={[styles.emojiContainer, { opacity: emojiAnim, transform: [{ scale: emojiScale }] }]}>
            <Text style={styles.emoji}>
              {currentScore > 0 ? SCORE_EMOJIS[currentScore] : '🫶'}
            </Text>
          </Animated.View>

          <Animated.Text style={[styles.moodLabel, { opacity: labelAnim, color: currentMetric.color }]}>
            {currentScore <= 2 ? currentMetric.lowLabel : currentScore >= 4 ? currentMetric.highLabel : 'okay'}
          </Animated.Text>

          <Animated.View style={[styles.scoresRow, fadeSlide(scoresAnim)]}>
            {SCORE_OPTIONS.map((score, i) => {
              const isSelected = currentScore === score;
              return (
                <Animated.View
                  key={score}
                  style={{
                    opacity: scoreButtonAnims[i],
                    transform: [
                      { scale: scoreScaleAnims[i] },
                      { translateY: scoreButtonAnims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                    ],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleSelectScore(score)}
                    activeOpacity={0.7}
                    style={[
                      styles.scoreButton,
                      isSelected && { backgroundColor: currentMetric.color, borderColor: currentMetric.color },
                    ]}
                  >
                    <Text style={[
                      styles.scoreText,
                      isSelected && styles.scoreTextActive,
                    ]}>
                      {score}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>

          <Animated.View style={[styles.scaleLabels, fadeSlide(scoresAnim)]}>
            <Text style={styles.scaleLabelText}>{currentMetric.lowLabel}</Text>
            <Text style={styles.scaleLabelText}>{currentMetric.highLabel}</Text>
          </Animated.View>
        </View>
      ) : (
        <Animated.View style={[styles.summaryArea, fadeSlide(summaryAnim)]}>
          <Text style={styles.summaryTitle}>your check-in</Text>
          <Text style={styles.summarySub}>
            {displayName ? `here's how you're feeling today, ${displayName}` : "here's how you're feeling today"}
          </Text>

          <View style={styles.summaryCards}>
            {metrics.map((metric, i) => {
              const val = scores[metric.id] ?? 3;
              return (
                <View key={metric.id} style={styles.summaryCard}>
                  <View style={styles.summaryCardLeft}>
                    <View style={[styles.summaryDot, { backgroundColor: metric.color }]} />
                    <Text style={styles.summaryMetricLabel}>{metric.label}</Text>
                  </View>
                  <View style={styles.summaryCardRight}>
                    <Text style={styles.summaryEmoji}>{SCORE_EMOJIS[val]}</Text>
                    <Text style={[styles.summaryScore, { color: metric.color }]}>{val}/5</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.summaryNote}>
            <Text style={styles.summaryNoteText}>
              This is what your daily check-in looks like.{'\n'}Track these metrics every day to see real patterns.
            </Text>
          </View>
        </Animated.View>
      )}

      {isLastStep && (
        <Animated.View style={[styles.footer, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <PrimaryButton title="log check-in" onPress={handleContinue} variant="white" />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden' as const,
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepIndicator: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  stepText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.3,
  },
  goalPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  goalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  goalPillText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  questionArea: {
    flex: 1,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
    justifyContent: 'center' as const,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  badgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5,
  },
  greeting: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 17,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
  },
  question: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    lineHeight: 34,
    marginBottom: 32,
    letterSpacing: -0.3,
  },
  emojiContainer: {
    marginBottom: 10,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center' as const,
  },
  moodLabel: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    textAlign: 'center' as const,
    marginBottom: 36,
    letterSpacing: -0.2,
  },
  scoresRow: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 10,
  },
  scoreButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scoreText: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: 'rgba(255,255,255,0.35)',
  },
  scoreTextActive: {
    color: '#FFFFFF',
  },
  scaleLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    width: 50 * 5 + 10 * 4,
    paddingHorizontal: 4,
  },
  scaleLabelText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
  },
  summaryArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center' as const,
  },
  summaryTitle: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  summarySub: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  summaryCards: {
    gap: 8,
    marginBottom: 24,
  },
  summaryCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  summaryCardLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryMetricLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryCardRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  summaryEmoji: {
    fontSize: 20,
  },
  summaryScore: {
    fontFamily: Fonts.heading,
    fontSize: 15,
  },
  summaryNote: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  summaryNoteText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 28,
  },
});
