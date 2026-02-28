import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated, PanResponder, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Coffee, Zap, Activity, Shield, Heart, Moon, Flame, Brain, Leaf, Sparkles, Target, Cloud, Sun, Thermometer, Circle, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOAL_METRICS, DEFAULT_METRICS, GOALS } from '@/constants/content';
import type { GoalMetric, ChoiceOption } from '@/constants/content';
import { useAppState } from '@/hooks/useAppState';
import PrimaryButton from '@/components/PrimaryButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 96;
const SLIDER_TRACK_HEIGHT = 6;
const THUMB_SIZE = 32;
const useNative = Platform.OS !== 'web';

const SCORE_LABELS: Record<number, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
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
  goalColor,
}: {
  metric: GoalMetric;
  value: number;
  onSelect: (score: number) => void;
  goalColor: string;
}) {
  const sliderAnim = useRef(new Animated.Value(value > 0 ? (value - 1) / 4 : 0)).current;
  const [currentVal, setCurrentVal] = useState(value);
  const lastHapticVal = useRef(value);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        const touchX = gestureState.x0 - 48;
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
        const touchX = gestureState.x0 + gestureState.dx - 48;
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

  const accentColor = metric.color;

  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.valueRow}>
        {currentVal > 0 ? (
          <>
            <Text style={[sliderStyles.valueNumber, { color: accentColor }]}>{currentVal}</Text>
            <Text style={[sliderStyles.valueLabel, { color: accentColor }]}>{SCORE_LABELS[currentVal]}</Text>
          </>
        ) : (
          <Text style={sliderStyles.valuePlaceholder}>slide to rate</Text>
        )}
      </View>

      <View style={sliderStyles.trackContainer} {...panResponder.panHandlers}>
        <View style={sliderStyles.track}>
          <Animated.View style={[sliderStyles.trackFill, { width: fillWidth, backgroundColor: accentColor }]} />
        </View>

        {[1, 2, 3, 4, 5].map((dot) => (
          <View
            key={dot}
            style={[
              sliderStyles.tickDot,
              { left: ((dot - 1) / 4) * (SLIDER_WIDTH - 4) },
              currentVal >= dot && { backgroundColor: accentColor },
            ]}
          />
        ))}

        <Animated.View style={[
          sliderStyles.thumb,
          {
            left: thumbLeft,
            backgroundColor: currentVal > 0 ? accentColor : Colors.mediumGray,
            shadowColor: accentColor,
          },
        ]}>
          <View style={sliderStyles.thumbInner} />
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
  goalColor,
}: {
  metric: GoalMetric;
  value: string;
  onSelect: (val: string) => void;
  goalColor: string;
}) {
  const options = metric.options ?? [];
  const IconComp = ICON_MAP[metric.icon] || Activity;

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
                backgroundColor: metric.color + '10',
                borderColor: metric.color + '50',
              },
            ]}
          >
            <View style={[
              choiceStyles.radioOuter,
              isSelected && { borderColor: metric.color },
            ]}>
              {isSelected && (
                <View style={[choiceStyles.radioInner, { backgroundColor: metric.color }]} />
              )}
            </View>
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
    return `${score}/5 — ${SCORE_LABELS[score] || ''}`;
  };

  const MetricIcon = currentMetric ? (ICON_MAP[currentMetric.icon] || Activity) : Activity;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <ChevronLeft size={24} color={Colors.navy} />
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
          <View style={styles.topContent}>
            {currentStep === 0 && displayName ? (
              <View style={styles.greetingRow}>
                <View style={[styles.greetingDot, { backgroundColor: goalColor }]} />
                <Text style={styles.greeting}>
                  {displayName.toLowerCase()}, let's check in
                </Text>
              </View>
            ) : null}

            <View style={[styles.metricIconWrap, { backgroundColor: currentMetric.color + '12' }]}>
              <MetricIcon size={22} color={currentMetric.color} strokeWidth={2} />
            </View>

            <Text style={styles.question}>{currentMetric.question}</Text>

            <View style={styles.metricTag}>
              <View style={[styles.metricTagDot, { backgroundColor: currentMetric.color }]} />
              <Text style={styles.metricTagText}>{currentMetric.label}</Text>
            </View>
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
        </Animated.View>
      ) : (
        <ScrollView style={styles.summaryScroll} contentContainerStyle={styles.summaryContent} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryHeaderSection}>
            <View style={[styles.summaryCheckCircle, { backgroundColor: goalColor + '12', borderColor: goalColor + '30' }]}>
              <TrendingUp size={28} color={goalColor} strokeWidth={2} />
            </View>
            <Text style={styles.summaryTitle}>your snapshot</Text>
            <Text style={styles.summarySub}>
              {displayName ? `here's what you logged, ${displayName.toLowerCase()}` : "here's what you logged"}
            </Text>
          </View>

          <View style={styles.summaryCards}>
            {metrics.map((metric) => {
              const IconComp = ICON_MAP[metric.icon] || Activity;
              return (
                <View key={metric.id} style={styles.summaryCard}>
                  <View style={styles.summaryCardLeft}>
                    <View style={[styles.summaryIconWrap, { backgroundColor: metric.color + '12' }]}>
                      <IconComp size={16} color={metric.color} strokeWidth={2} />
                    </View>
                    <Text style={styles.summaryMetricLabel}>{metric.label}</Text>
                  </View>
                  <Text style={[styles.summaryValue, { color: metric.color }]} numberOfLines={1}>
                    {getSummaryValue(metric)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={[styles.summaryNote, { borderLeftColor: goalColor }]}>
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

const sliderStyles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 0,
  },
  valueRow: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: 8,
    marginBottom: 20,
    minHeight: 32,
  },
  valueNumber: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    letterSpacing: -1,
  },
  valueLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 16,
  },
  valuePlaceholder: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: Colors.mediumGray,
  },
  trackContainer: {
    height: 48,
    justifyContent: 'center' as const,
    position: 'relative' as const,
  },
  track: {
    height: SLIDER_TRACK_HEIGHT,
    backgroundColor: Colors.lightGray,
    borderRadius: SLIDER_TRACK_HEIGHT / 2,
    overflow: 'hidden' as const,
  },
  trackFill: {
    height: '100%',
    borderRadius: SLIDER_TRACK_HEIGHT / 2,
  },
  tickDot: {
    position: 'absolute' as const,
    top: (48 - SLIDER_TRACK_HEIGHT) / 2 + SLIDER_TRACK_HEIGHT / 2 - 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  thumb: {
    position: 'absolute' as const,
    top: (48 - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  thumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  labels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 8,
  },
  labelText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.mediumGray,
    maxWidth: '45%',
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
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  stepText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.mediumGray,
    minWidth: 30,
    textAlign: 'right' as const,
  },
  questionArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topContent: {
    paddingTop: 16,
    marginBottom: 32,
  },
  greetingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 20,
  },
  greetingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  greeting: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: Colors.mediumGray,
  },
  metricIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  question: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    lineHeight: 34,
    marginBottom: 12,
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
  inputArea: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 24,
    shadowColor: '#8A7A68',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(138,122,104,0.06)',
  },
  summaryScroll: {
    flex: 1,
  },
  summaryContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  summaryHeaderSection: {
    alignItems: 'center' as const,
    marginBottom: 28,
  },
  summaryCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    marginBottom: 16,
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
  },
  summaryCards: {
    gap: 8,
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
  summaryIconWrap: {
    width: 32,
    height: 32,
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
  summaryNote: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(138,122,104,0.06)',
    borderLeftWidth: 3,
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
