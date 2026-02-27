import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOAL_METRICS, DEFAULT_METRICS, GOALS } from '@/constants/content';
import type { GoalMetric, ChoiceOption } from '@/constants/content';
import { useAppState } from '@/hooks/useAppState';
import PrimaryButton from '@/components/PrimaryButton';

const SCORE_OPTIONS = [1, 2, 3, 4, 5];

const SCORE_LABELS: Record<number, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

function ScoreInput({
  metric,
  value,
  onSelect,
}: {
  metric: GoalMetric;
  value: number;
  onSelect: (score: number) => void;
}) {
  return (
    <View style={scoreStyles.container}>
      <View style={scoreStyles.row}>
        {SCORE_OPTIONS.map((score) => {
          const isSelected = value === score;
          return (
            <TouchableOpacity
              key={score}
              onPress={() => onSelect(score)}
              activeOpacity={0.7}
              style={[
                scoreStyles.button,
                isSelected && { backgroundColor: metric.color, borderColor: metric.color },
              ]}
            >
              <Text style={[
                scoreStyles.buttonText,
                isSelected && scoreStyles.buttonTextActive,
              ]}>
                {score}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={scoreStyles.labels}>
        <Text style={scoreStyles.labelText}>{metric.lowLabel}</Text>
        {value > 0 && (
          <Text style={[scoreStyles.selectedLabel, { color: metric.color }]}>
            {SCORE_LABELS[value]}
          </Text>
        )}
        <Text style={scoreStyles.labelText}>{metric.highLabel}</Text>
      </View>
    </View>
  );
}

function ChoiceInput({
  metric,
  value,
  onSelect,
}: {
  metric: GoalMetric;
  value: string;
  onSelect: (val: string) => void;
}) {
  const options = metric.options ?? [];
  return (
    <View style={choiceStyles.container}>
      {options.map((option: ChoiceOption) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
            style={[
              choiceStyles.option,
              isSelected && { backgroundColor: metric.color + '12', borderColor: metric.color },
            ]}
          >
            {option.emoji && <Text style={choiceStyles.emoji}>{option.emoji}</Text>}
            <Text style={[
              choiceStyles.optionText,
              isSelected && { color: Colors.navy },
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function SimCheckinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, userName } = useAppState();

  const metrics = GOAL_METRICS[goal] || DEFAULT_METRICS;
  const goalData = GOALS.find(g => g.id === goal);
  const goalColor = Colors.category[goal] || Colors.blue;

  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [choices, setChoices] = useState<Record<string, string>>({});

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentMetric = metrics[currentStep] as GoalMetric | undefined;
  const isLastStep = currentStep >= metrics.length;
  const displayName = userName ? userName.split(' ')[0] : '';

  const isCurrentAnswered = useCallback(() => {
    if (!currentMetric) return false;
    if (currentMetric.type === 'choice') {
      return !!choices[currentMetric.id];
    }
    return (scores[currentMetric.id] ?? 0) > 0;
  }, [currentMetric, scores, choices]);

  const handleScoreSelect = useCallback((score: number) => {
    if (!currentMetric) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScores(prev => ({ ...prev, [currentMetric.id]: score }));
  }, [currentMetric]);

  const handleChoiceSelect = useCallback((val: string) => {
    if (!currentMetric) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChoices(prev => ({ ...prev, [currentMetric.id]: val }));
  }, [currentMetric]);

  const animateTransition = useCallback((callback: () => void) => {
    const useNative = Platform.OS !== 'web';
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: useNative,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: useNative,
      }).start();
    });
  }, [fadeAnim]);

  const handleNext = useCallback(() => {
    if (!isCurrentAnswered()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStep < metrics.length - 1) {
      animateTransition(() => setCurrentStep(prev => prev + 1));
    } else {
      animateTransition(() => setCurrentStep(metrics.length));
    }
  }, [currentStep, metrics.length, isCurrentAnswered, animateTransition]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      router.back();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition(() => setCurrentStep(prev => prev - 1));
  }, [currentStep, router, animateTransition]);

  const { updateState } = useAppState();

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('[SimCheckin] Saving onboarding sim data:', { scores, choices });
    updateState({
      onboardingSimData: {
        scores,
        choices,
        completedAt: new Date().toISOString(),
      },
    });
    router.push('/onboarding/sim-congrats' as any);
  }, [router, scores, choices, updateState]);

  const progressFraction = (currentStep + (isCurrentAnswered() ? 1 : 0)) / metrics.length;

  const getSummaryValue = (metric: GoalMetric): string => {
    if (metric.type === 'choice') {
      const val = choices[metric.id];
      const opt = metric.options?.find(o => o.value === val);
      return opt ? `${opt.emoji ?? ''} ${opt.label}` : '';
    }
    const score = scores[metric.id] ?? 0;
    return `${score}/5`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <ChevronLeft size={24} color={Colors.navy} />
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressFraction * 100}%`, backgroundColor: goalColor }]} />
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      {!isLastStep && currentMetric ? (
        <Animated.View style={[styles.questionArea, { opacity: fadeAnim }]}>
          <View style={styles.topContent}>
            {currentStep === 0 && displayName ? (
              <Text style={styles.greeting}>
                {displayName.toLowerCase()}, let's check in
              </Text>
            ) : null}

            <View style={styles.stepRow}>
              <View style={[styles.goalPill, { backgroundColor: goalColor + '14' }]}>
                <View style={[styles.goalDot, { backgroundColor: goalColor }]} />
                <Text style={[styles.goalPillText, { color: goalColor }]}>
                  {goalData?.label ?? 'Daily'}
                </Text>
              </View>
              <Text style={styles.stepCounter}>
                {currentStep + 1} of {metrics.length}
              </Text>
            </View>

            <Text style={styles.question}>{currentMetric.question}</Text>

            <View style={styles.metricTag}>
              <View style={[styles.metricTagDot, { backgroundColor: currentMetric.color }]} />
              <Text style={styles.metricTagText}>{currentMetric.label}</Text>
            </View>
          </View>

          <View style={styles.inputCard}>
            {currentMetric.type === 'score' ? (
              <ScoreInput
                metric={currentMetric}
                value={scores[currentMetric.id] ?? 0}
                onSelect={handleScoreSelect}
              />
            ) : (
              <ChoiceInput
                metric={currentMetric}
                value={choices[currentMetric.id] ?? ''}
                onSelect={handleChoiceSelect}
              />
            )}
          </View>
        </Animated.View>
      ) : (
        <ScrollView style={styles.summaryScroll} contentContainerStyle={styles.summaryContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.summaryTitle}>your snapshot</Text>
          <Text style={styles.summarySub}>
            {displayName ? `here's what you logged, ${displayName.toLowerCase()}` : "here's what you logged"}
          </Text>

          <View style={styles.summaryCards}>
            {metrics.map((metric) => (
              <View key={metric.id} style={styles.summaryCard}>
                <View style={styles.summaryCardLeft}>
                  <View style={[styles.summaryDot, { backgroundColor: metric.color }]} />
                  <View style={styles.summaryCardInfo}>
                    <Text style={styles.summaryMetricLabel}>{metric.label}</Text>
                  </View>
                </View>
                <Text style={[styles.summaryValue, { color: metric.color }]}>
                  {getSummaryValue(metric)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.summaryNote}>
            <Text style={styles.summaryNoteTitle}>this is your daily check-in</Text>
            <Text style={styles.summaryNoteText}>
              Track these metrics every day to reveal patterns you can't feel day-to-day.
            </Text>
          </View>
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {isLastStep ? (
          <PrimaryButton title="log check-in" onPress={handleContinue} />
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={[
              styles.nextButton,
              isCurrentAnswered()
                ? { backgroundColor: Colors.navy }
                : { backgroundColor: Colors.lightGray },
            ]}
          >
            <Text style={[
              styles.nextButtonText,
              isCurrentAnswered()
                ? { color: Colors.white }
                : { color: Colors.mediumGray },
            ]}>
              {currentStep < metrics.length - 1 ? 'Next' : 'See summary'}
            </Text>
            {isCurrentAnswered() && <ChevronRight size={18} color={Colors.white} strokeWidth={2.5} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row' as const,
    gap: 10,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  button: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.mediumGray,
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  labels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    width: 54 * 5 + 10 * 4,
    alignSelf: 'center' as const,
    paddingHorizontal: 4,
  },
  labelText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.mediumGray,
  },
  selectedLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 13,
  },
});

const choiceStyles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.cream,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 10,
  },
  emoji: {
    fontSize: 18,
  },
  optionText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: Colors.darkGray,
    flex: 1,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backPlaceholder: {
    width: 36,
    height: 36,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 100,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: 100,
  },
  questionArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topContent: {
    paddingTop: 12,
    marginBottom: 28,
  },
  greeting: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: Colors.mediumGray,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
  },
  goalPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  stepCounter: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.mediumGray,
  },
  question: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    lineHeight: 34,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  metricTag: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  metricTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricTagText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.mediumGray,
    letterSpacing: 0.3,
  },
  inputCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#8A7A68',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(138,122,104,0.06)',
  },
  summaryScroll: {
    flex: 1,
  },
  summaryContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  summaryTitle: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    textAlign: 'center' as const,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  summarySub: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    marginBottom: 28,
  },
  summaryCards: {
    gap: 6,
    marginBottom: 20,
  },
  summaryCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(138,122,104,0.06)',
    shadowColor: '#8A7A68',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  summaryCardLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryCardInfo: {
    flex: 1,
  },
  summaryMetricLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: Colors.navy,
  },
  summaryValue: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    marginLeft: 8,
  },
  summaryNote: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(138,122,104,0.06)',
    alignItems: 'center' as const,
  },
  summaryNoteTitle: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.navy,
    marginBottom: 6,
  },
  summaryNoteText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  nextButton: {
    height: 56,
    borderRadius: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 6,
  },
  nextButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
