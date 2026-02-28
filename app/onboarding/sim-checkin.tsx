import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated, PanResponder, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Coffee, Zap, Activity, Shield, Heart, Moon, Flame, Brain, Leaf, Sparkles, Target, Cloud, Sun, Thermometer, Circle, RotateCcw, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOAL_METRICS, DEFAULT_METRICS, GOALS } from '@/constants/content';
import type { GoalMetric, ChoiceOption } from '@/constants/content';
import { useAppState } from '@/hooks/useAppState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 112;
const SLIDER_TRACK_HEIGHT = 8;
const THUMB_SIZE = 28;
const useNative = Platform.OS !== 'web';

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Rough', color: '#E57373' },
  2: { label: 'Low', color: '#E8A838' },
  3: { label: 'Okay', color: '#D4A853' },
  4: { label: 'Good', color: '#5A8A6F' },
  5: { label: 'Great', color: '#2E7D52' },
};

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Sunrise: Sun,
  BatteryLow: Zap,
  Activity: Activity,
  Coffee: Coffee,
  Leaf: Leaf,
  Wind: Cloud,
  Clock: Clock,
  Shield: Shield,
  Heart: Heart,
  Moon: Moon,
  Flame: Flame,
  Brain: Brain,
  Sparkles: Sparkles,
  Target: Target,
  Cloud: Cloud,
  Sun: Sun,
  Thermometer: Thermometer,
  Circle: Circle,
  RotateCcw: RotateCcw,
  Zap: Zap,
  Lightbulb: Sparkles,
  Utensils: Coffee,
  Cookie: Circle,
  Star: Sparkles,
  TrendingUp: TrendingUp,
};

function SliderInput({
  metric,
  value,
  onSelect,
}: {
  metric: GoalMetric;
  value: number;
  onSelect: (score: number) => void;
  goalColor: string;
}) {
  const sliderAnim = useRef(new Animated.Value(value > 0 ? (value - 1) / 4 : 0.5)).current;
  const [currentVal, setCurrentVal] = useState(value || 3);
  const lastHapticVal = useRef(value || 3);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        const touchX = gestureState.x0 - 56;
        const fraction = Math.max(0, Math.min(1, touchX / SLIDER_WIDTH));
        const score = Math.round(fraction * 4) + 1;
        const snappedFraction = (score - 1) / 4;
        sliderAnim.setValue(snappedFraction);
        setCurrentVal(score);
        onSelect(score);
        if (score !== lastHapticVal.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          lastHapticVal.current = score;
        }
      },
      onPanResponderMove: (_, gestureState) => {
        const touchX = gestureState.x0 + gestureState.dx - 56;
        const fraction = Math.max(0, Math.min(1, touchX / SLIDER_WIDTH));
        const score = Math.round(fraction * 4) + 1;
        const snappedFraction = (score - 1) / 4;
        sliderAnim.setValue(snappedFraction);
        if (score !== lastHapticVal.current) {
          setCurrentVal(score);
          onSelect(score);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          lastHapticVal.current = score;
        }
      },
      onPanResponderRelease: () => {
        const score = lastHapticVal.current;
        const snappedFraction = (score - 1) / 4;
        Animated.spring(sliderAnim, {
          toValue: snappedFraction,
          useNativeDriver: false,
          damping: 20,
          stiffness: 300,
        }).start();
      },
    })
  ).current;

  const thumbLeft = sliderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SLIDER_WIDTH - THUMB_SIZE],
  });

  const fillWidth = sliderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const scoreInfo = SCORE_LABELS[currentVal] || SCORE_LABELS[3];
  const accentColor = scoreInfo.color;

  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.valueRow}>
        <Text style={[sliderStyles.valueNumber, { color: accentColor }]}>{currentVal}</Text>
        <View style={[sliderStyles.valueBadge, { backgroundColor: accentColor + '15' }]}>
          <Text style={[sliderStyles.valueLabel, { color: accentColor }]}>{scoreInfo.label}</Text>
        </View>
      </View>

      <View style={sliderStyles.trackContainer} {...panResponder.panHandlers}>
        <View style={sliderStyles.track}>
          <Animated.View style={[sliderStyles.trackFill, { width: fillWidth, backgroundColor: accentColor }]} />
        </View>

        <Animated.View style={[
          sliderStyles.thumb,
          {
            left: thumbLeft,
            backgroundColor: '#FFFFFF',
            borderColor: accentColor,
          },
        ]}>
          <View style={[sliderStyles.thumbDot, { backgroundColor: accentColor }]} />
        </Animated.View>
      </View>

      <View style={sliderStyles.labels}>
        <Text style={sliderStyles.labelText}>{metric.lowLabel}</Text>
        <Text style={sliderStyles.labelText}>{metric.highLabel}</Text>
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
  goalColor: string;
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
              isSelected && {
                backgroundColor: metric.color + '08',
                borderColor: metric.color,
              },
            ]}
          >
            <View style={[
              choiceStyles.checkOuter,
              isSelected && { borderColor: metric.color, backgroundColor: metric.color },
            ]}>
              {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text style={[
              choiceStyles.optionText,
              isSelected && { color: Colors.navy, fontFamily: Fonts.headingSemiBold },
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
  const slideAnim = useRef(new Animated.Value(0)).current;

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
    setScores(prev => ({ ...prev, [currentMetric.id]: score }));
  }, [currentMetric]);

  const handleChoiceSelect = useCallback((val: string) => {
    if (!currentMetric) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChoices(prev => ({ ...prev, [currentMetric.id]: val }));
  }, [currentMetric]);

  const animateTransition = useCallback((callback: () => void, direction: 'forward' | 'back' = 'forward') => {
    const exitVal = direction === 'forward' ? -30 : 30;
    const enterVal = direction === 'forward' ? 30 : -30;

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: useNative }),
      Animated.timing(slideAnim, { toValue: exitVal, duration: 150, useNativeDriver: useNative }),
    ]).start(() => {
      callback();
      slideAnim.setValue(enterVal);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: useNative }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: useNative, damping: 20, stiffness: 200 }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const handleNext = useCallback(() => {
    if (!isCurrentAnswered()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStep < metrics.length - 1) {
      animateTransition(() => setCurrentStep(prev => prev + 1), 'forward');
    } else {
      animateTransition(() => setCurrentStep(metrics.length), 'forward');
    }
  }, [currentStep, metrics.length, isCurrentAnswered, animateTransition]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      router.back();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition(() => setCurrentStep(prev => prev - 1), 'back');
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
      return opt ? opt.label : '';
    }
    const score = scores[metric.id] ?? 0;
    const info = SCORE_LABELS[score];
    return `${score}/5 — ${info?.label || ''}`;
  };

  const getScoreColor = (metric: GoalMetric): string => {
    if (metric.type === 'choice') return metric.color;
    const score = scores[metric.id] ?? 0;
    return SCORE_LABELS[score]?.color || metric.color;
  };

  const MetricIcon = currentMetric ? (ICON_MAP[currentMetric.icon] || Activity) : Activity;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <ChevronLeft size={22} color={Colors.navy} />
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: `${progressFraction * 100}%`, backgroundColor: goalColor }]} />
        </View>
        <Text style={styles.stepText}>
          {isLastStep ? '' : `${currentStep + 1}/${metrics.length}`}
        </Text>
      </View>

      {!isLastStep && currentMetric ? (
        <Animated.View style={[styles.questionArea, {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {currentStep === 0 && displayName ? (
              <Text style={styles.greeting}>
                {displayName.toLowerCase()}, let's check in
              </Text>
            ) : null}

            <View style={[styles.metricIconWrap, { backgroundColor: currentMetric.color + '12' }]}>
              <MetricIcon size={20} color={currentMetric.color} strokeWidth={2} />
            </View>

            <Text style={styles.question}>{currentMetric.question}</Text>

            <View style={[styles.metricTag, { backgroundColor: currentMetric.color + '10' }]}>
              <View style={[styles.metricTagDot, { backgroundColor: currentMetric.color }]} />
              <Text style={[styles.metricTagText, { color: currentMetric.color }]}>{currentMetric.label}</Text>
            </View>

            <View style={styles.inputArea}>
              {currentMetric.type === 'score' ? (
                <SliderInput
                  metric={currentMetric}
                  value={scores[currentMetric.id] ?? 0}
                  onSelect={handleScoreSelect}
                  goalColor={goalColor}
                />
              ) : (
                <ChoiceInput
                  metric={currentMetric}
                  value={choices[currentMetric.id] ?? ''}
                  onSelect={handleChoiceSelect}
                  goalColor={goalColor}
                />
              )}
            </View>
          </ScrollView>
        </Animated.View>
      ) : (
        <ScrollView style={styles.summaryScroll} contentContainerStyle={styles.summaryContent} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryHeaderSection}>
            <View style={[styles.summaryIconCircle, { backgroundColor: goalColor + '10', borderColor: goalColor + '25' }]}>
              <TrendingUp size={24} color={goalColor} strokeWidth={2.2} />
            </View>
            <Text style={styles.summaryTitle}>Your Snapshot</Text>
            <Text style={styles.summarySub}>
              {displayName ? `Here's what you logged, ${displayName.toLowerCase()}` : "Here's what you logged"}
            </Text>
          </View>

          <View style={styles.summaryCards}>
            {metrics.map((metric) => {
              const IconComp = ICON_MAP[metric.icon] || Activity;
              const valueColor = getScoreColor(metric);
              return (
                <View key={metric.id} style={styles.summaryCard}>
                  <View style={styles.summaryCardLeft}>
                    <View style={[styles.summaryIconWrap, { backgroundColor: metric.color + '10' }]}>
                      <IconComp size={16} color={metric.color} strokeWidth={2} />
                    </View>
                    <Text style={styles.summaryMetricLabel}>{metric.label}</Text>
                  </View>
                  <Text style={[styles.summaryValue, { color: valueColor }]} numberOfLines={1}>
                    {getSummaryValue(metric)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.summaryInsight}>
            <View style={[styles.insightAccent, { backgroundColor: goalColor }]} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>This is your daily check-in</Text>
              <Text style={styles.insightText}>
                Track these metrics every day to reveal patterns you can't feel day-to-day.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {isLastStep ? (
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.85}
            style={[styles.primaryButton, { backgroundColor: goalColor }]}
          >
            <Text style={styles.primaryButtonText}>Log Check-In</Text>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={[
              styles.primaryButton,
              isCurrentAnswered()
                ? { backgroundColor: Colors.navy }
                : { backgroundColor: '#E0DDD9' },
            ]}
          >
            <Text style={[
              styles.primaryButtonText,
              !isCurrentAnswered() && { color: '#9A9A9A' },
            ]}>
              {currentStep < metrics.length - 1 ? 'Next' : 'See Summary'}
            </Text>
            {isCurrentAnswered() && <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  valueRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 24,
  },
  valueNumber: {
    fontFamily: Fonts.heading,
    fontSize: 44,
    letterSpacing: -2,
  },
  valueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  valueLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  trackContainer: {
    height: 48,
    justifyContent: 'center' as const,
    position: 'relative' as const,
  },
  track: {
    height: SLIDER_TRACK_HEIGHT,
    backgroundColor: '#EEEAE4',
    borderRadius: SLIDER_TRACK_HEIGHT / 2,
    overflow: 'hidden' as const,
  },
  trackFill: {
    height: '100%',
    borderRadius: SLIDER_TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute' as const,
    top: (48 - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 10,
  },
  labelText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9A9A9A',
    maxWidth: '45%',
  },
});

const choiceStyles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10,
  },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#EEEAE4',
    gap: 14,
  },
  checkOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D0CCC6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  optionText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: '#5A5A6A',
    flex: 1,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    borderRadius: 18,
    backgroundColor: '#F5F3F0',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#EEEAE4',
    borderRadius: 100,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: 100,
  },
  stepText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: '#9A9A9A',
    minWidth: 30,
    textAlign: 'right' as const,
  },
  questionArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: '#9A9A9A',
    marginBottom: 20,
  },
  metricIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 18,
  },
  question: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    lineHeight: 34,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  metricTag: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 32,
  },
  metricTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricTagText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  inputArea: {
    backgroundColor: '#FAFAF8',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EEEAE4',
  },
  summaryScroll: {
    flex: 1,
  },
  summaryContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  summaryHeaderSection: {
    alignItems: 'center' as const,
    marginBottom: 28,
  },
  summaryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryTitle: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    textAlign: 'center' as const,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  summarySub: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: '#9A9A9A',
    textAlign: 'center' as const,
  },
  summaryCards: {
    gap: 8,
    marginBottom: 20,
  },
  summaryCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: '#FAFAF8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#EEEAE4',
  },
  summaryCardLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  summaryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  summaryMetricLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: Colors.navy,
  },
  summaryValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    marginLeft: 8,
    maxWidth: '40%',
    textAlign: 'right' as const,
  },
  summaryInsight: {
    flexDirection: 'row' as const,
    backgroundColor: '#FAFAF8',
    borderRadius: 14,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: '#EEEAE4',
  },
  insightAccent: {
    width: 4,
  },
  insightContent: {
    flex: 1,
    padding: 16,
  },
  insightTitle: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: Colors.navy,
    marginBottom: 4,
  },
  insightText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: '#9A9A9A',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0EEED',
  },
  primaryButton: {
    height: 56,
    borderRadius: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
