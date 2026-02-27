import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
              isSelected && { backgroundColor: metric.color + '18', borderColor: metric.color },
            ]}
          >
            {option.emoji && <Text style={choiceStyles.emoji}>{option.emoji}</Text>}
            <Text style={[
              choiceStyles.optionText,
              isSelected && { color: '#FFFFFF' },
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
  const bgColor = BG_PALETTES[goal] || '#0F1320';

  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [choices, setChoices] = useState<Record<string, string>>({});

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentMetric = metrics[currentStep] as GoalMetric | undefined;
  const isLastStep = currentStep >= metrics.length;
  const displayName = userName ? userName.split(' ')[0].toLowerCase() : '';

  const isCurrentAnswered = useCallback(() => {
    if (!currentMetric) return false;
    if (currentMetric.type === 'choice') {
      return !!choices[currentMetric.id];
    }
    return (scores[currentMetric.id] ?? 0) > 0;
  }, [currentMetric, scores, choices]);

  const answeredCount = metrics.filter(m => {
    if (m.type === 'choice') return !!choices[m.id];
    return (scores[m.id] ?? 0) > 0;
  }).length;

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

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/sim-congrats' as any);
  }, [router]);

  const progressWidth = `${((currentStep + (isCurrentAnswered() ? 1 : 0)) / metrics.length) * 100}%` as const;

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
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressWidth, backgroundColor: goalColor }]} />
        </View>

        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {isLastStep ? 'summary' : `${currentStep + 1} of ${metrics.length}`}
          </Text>
          {goalData && (
            <View style={[styles.goalPill, { backgroundColor: goalColor + '20' }]}>
              <View style={[styles.goalDot, { backgroundColor: goalColor }]} />
              <Text style={[styles.goalPillText, { color: goalColor }]}>{goalData.label}</Text>
            </View>
          )}
        </View>
      </View>

      {!isLastStep && currentMetric ? (
        <Animated.View style={[styles.questionArea, { opacity: fadeAnim }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>DAILY CHECK-IN</Text>
          </View>

          {displayName && currentStep === 0 ? (
            <Text style={styles.greeting}>hey {displayName} 👋</Text>
          ) : null}

          <Text style={styles.question}>{currentMetric.question}</Text>

          <View style={styles.typeTag}>
            <View style={[styles.typeTagDot, { backgroundColor: currentMetric.color }]} />
            <Text style={[styles.typeTagText, { color: currentMetric.color }]}>{currentMetric.label}</Text>
          </View>

          <View style={styles.inputArea}>
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
          <Text style={styles.summaryTitle}>your check-in</Text>
          <Text style={styles.summarySub}>
            {displayName ? `here's your snapshot, ${displayName}` : "here's your snapshot"}
          </Text>

          <View style={styles.summaryCards}>
            {metrics.map((metric) => (
              <View key={metric.id} style={styles.summaryCard}>
                <View style={styles.summaryCardLeft}>
                  <View style={[styles.summaryDot, { backgroundColor: metric.color }]} />
                  <View style={styles.summaryCardInfo}>
                    <Text style={styles.summaryMetricLabel}>{metric.label}</Text>
                    <Text style={styles.summaryMetricQuestion}>{metric.question}</Text>
                  </View>
                </View>
                <Text style={[styles.summaryValue, { color: metric.color }]}>
                  {getSummaryValue(metric)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.summaryNote}>
            <Text style={styles.summaryNoteText}>
              This is what your daily check-in looks like.{'\n'}Track these metrics every day to see real patterns.
            </Text>
          </View>
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {isLastStep ? (
          <PrimaryButton title="log check-in" onPress={handleContinue} variant="white" />
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={[
              styles.nextButton,
              isCurrentAnswered()
                ? { backgroundColor: goalColor }
                : { backgroundColor: 'rgba(255,255,255,0.08)' },
            ]}
          >
            <Text style={[
              styles.nextButtonText,
              !isCurrentAnswered() && { color: 'rgba(255,255,255,0.25)' },
            ]}>
              {currentStep < metrics.length - 1 ? 'Next' : 'See summary'}
            </Text>
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
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: 'rgba(255,255,255,0.35)',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  labels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    width: 52 * 5 + 10 * 4,
    alignSelf: 'center' as const,
    paddingHorizontal: 4,
  },
  labelText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  emoji: {
    fontSize: 20,
  },
  optionText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
  },
});

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
    paddingHorizontal: 28,
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
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  typeTag: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 28,
  },
  typeTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typeTagText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  inputArea: {
    width: '100%',
    alignItems: 'center' as const,
  },
  summaryScroll: {
    flex: 1,
  },
  summaryContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
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
    marginBottom: 28,
  },
  summaryCards: {
    gap: 8,
    marginBottom: 20,
  },
  summaryCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryMetricQuestion: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 1,
  },
  summaryValue: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    marginLeft: 8,
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
    paddingTop: 12,
  },
  nextButton: {
    height: 54,
    borderRadius: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  nextButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
