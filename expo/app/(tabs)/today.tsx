import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Flame, CheckCircle, Moon, Zap, Smile, Shield, ChevronRight,
  BatteryLow, Activity, Sunrise, Clock, Brain, Target, Lightbulb,
  Leaf, Wind, Heart, Thermometer, Sparkles, RotateCcw, Dumbbell,
  Cookie, Utensils, Eye, Cloud, Circle, TrendingUp, Coffee,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { PRODUCTS } from '@/constants/products';
import { GOALS, getDayInsight, getVariableReward, GOAL_METRICS, DEFAULT_METRICS } from '@/constants/content';
import type { GoalMetric, ChoiceOption } from '@/constants/content';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  Zap, BatteryLow, Activity, Moon, Sunrise, Clock, Brain, Target, Lightbulb,
  Leaf, Wind, Shield, Heart, Thermometer, Sparkles, RotateCcw, Dumbbell,
  Cookie, Utensils, Smile, Flame, Eye, Cloud, Circle, TrendingUp, Coffee,
};

const SCORE_EMOJIS: Record<number, string> = {
  1: '😣',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

function ConfettiParticle({ delay, color, startX }: { delay: number; color: string; startX: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 1400,
      delay,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [anim, delay]);

  const velocityX = (Math.random() - 0.5) * 350;
  const size = 4 + Math.random() * 5;
  const isRound = Math.random() > 0.4;

  return (
    <Animated.View
      style={{
        position: 'absolute' as const,
        width: size,
        height: isRound ? size : size * 2.5,
        borderRadius: isRound ? size / 2 : 2,
        backgroundColor: color,
        left: startX,
        top: 0,
        opacity: anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 0.8, 0] }),
        transform: [
          { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, velocityX] }) },
          { translateY: anim.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, -140, 60] }) },
          { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${Math.random() * 900}deg`] }) },
        ],
      }}
    />
  );
}

function ScoreMetricCard({
  metric,
  value,
  onChange,
  index,
}: {
  metric: GoalMetric;
  value: number;
  onChange: (v: number) => void;
  index: number;
}) {
  const scaleAnims = useRef([1, 2, 3, 4, 5].map(() => new Animated.Value(1))).current;
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enterAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 22,
      stiffness: 160,
      delay: index * 80,
    }).start();
  }, [enterAnim, index]);

  const handleSelect = useCallback((score: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scaleAnims[score - 1], { toValue: 1.25, useNativeDriver: Platform.OS !== 'web', speed: 80, bounciness: 0 }),
      Animated.spring(scaleAnims[score - 1], { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 10, stiffness: 200 }),
    ]).start();
    onChange(score);
  }, [onChange, scaleAnims]);

  const IconComponent = ICON_MAP[metric.icon];

  return (
    <Animated.View
      style={[
        cardStyles.card,
        {
          opacity: enterAnim,
          transform: [{
            translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
          }],
        },
      ]}
    >
      <View style={cardStyles.cardHeader}>
        <View style={[cardStyles.iconBubble, { backgroundColor: metric.color + '18' }]}>
          {IconComponent && <IconComponent size={18} color={metric.color} strokeWidth={2} />}
        </View>
        <View style={cardStyles.cardHeaderText}>
          <Text style={cardStyles.question}>{metric.question}</Text>
        </View>
        {value > 0 && (
          <Text style={cardStyles.emoji}>{SCORE_EMOJIS[value]}</Text>
        )}
      </View>

      <View style={cardStyles.scaleRow}>
        {[1, 2, 3, 4, 5].map((score) => {
          const isSelected = value === score;
          const isFilled = value >= score;
          return (
            <TouchableOpacity
              key={score}
              onPress={() => handleSelect(score)}
              activeOpacity={0.7}
              style={cardStyles.scaleTouchable}
              testID={`metric-${metric.id}-${score}`}
            >
              <Animated.View
                style={[
                  cardStyles.scaleCircle,
                  isFilled && { backgroundColor: metric.color, borderColor: metric.color },
                  isSelected && { backgroundColor: metric.color, borderColor: metric.color },
                  { transform: [{ scale: scaleAnims[score - 1] }] },
                ]}
              >
                <Text style={[
                  cardStyles.scaleNumber,
                  isFilled && { color: '#FFF' },
                ]}>
                  {score}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={cardStyles.labelRow}>
        <Text style={cardStyles.lowLabel}>{metric.lowLabel}</Text>
        <Text style={cardStyles.highLabel}>{metric.highLabel}</Text>
      </View>
    </Animated.View>
  );
}

function ChoiceMetricCard({
  metric,
  value,
  onChange,
  index,
}: {
  metric: GoalMetric;
  value: string;
  onChange: (v: string) => void;
  index: number;
}) {
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enterAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 22,
      stiffness: 160,
      delay: index * 80,
    }).start();
  }, [enterAnim, index]);

  const IconComponent = ICON_MAP[metric.icon];
  const options = metric.options ?? [];

  return (
    <Animated.View
      style={[
        cardStyles.card,
        {
          opacity: enterAnim,
          transform: [{
            translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
          }],
        },
      ]}
    >
      <View style={cardStyles.cardHeader}>
        <View style={[cardStyles.iconBubble, { backgroundColor: metric.color + '18' }]}>
          {IconComponent && <IconComponent size={18} color={metric.color} strokeWidth={2} />}
        </View>
        <View style={cardStyles.cardHeaderText}>
          <Text style={cardStyles.question}>{metric.question}</Text>
        </View>
      </View>

      <View style={choiceCardStyles.optionsGrid}>
        {options.map((option: ChoiceOption) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(option.value);
              }}
              activeOpacity={0.7}
              style={[
                choiceCardStyles.option,
                isSelected && { backgroundColor: metric.color + '15', borderColor: metric.color },
              ]}
            >
              {option.emoji && <Text style={choiceCardStyles.optionEmoji}>{option.emoji}</Text>}
              <Text style={[
                choiceCardStyles.optionLabel,
                isSelected && { color: metric.color },
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

function ScoreSummaryRow({ metric, scoreValue, choiceValue }: { metric: GoalMetric; scoreValue?: number; choiceValue?: string }) {
  const IconComponent = ICON_MAP[metric.icon];

  let displayValue = '';
  if (metric.type === 'choice' && choiceValue) {
    const opt = metric.options?.find(o => o.value === choiceValue);
    displayValue = opt ? `${opt.emoji ?? ''} ${opt.label}` : choiceValue;
  } else if (metric.type === 'score' && scoreValue) {
    displayValue = `${scoreValue}/5`;
  }

  return (
    <View style={summaryRowStyles.row}>
      <View style={[summaryRowStyles.iconDot, { backgroundColor: metric.color + '18' }]}>
        {IconComponent && <IconComponent size={14} color={metric.color} strokeWidth={2} />}
      </View>
      <Text style={summaryRowStyles.label}>{metric.label}</Text>
      <View style={summaryRowStyles.valueContainer}>
        {metric.type === 'score' && scoreValue ? (
          <>
            <Text style={[summaryRowStyles.score, { color: metric.color }]}>{scoreValue}/5</Text>
            <Text style={summaryRowStyles.emoji}>{SCORE_EMOJIS[scoreValue] ?? ''}</Text>
          </>
        ) : (
          <Text style={[summaryRowStyles.choiceText, { color: metric.color }]}>{displayValue}</Text>
        )}
      </View>
    </View>
  );
}

const summaryRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    gap: 10,
  },
  iconDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  label: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: Colors.darkGray,
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  score: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 15,
  },
  emoji: {
    fontSize: 16,
  },
  choiceText: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 13,
  },
});

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { goal, products, customProducts, currentStreak, currentDay, isCheckedInToday, checkIn, userName, dailyScores, streakShieldAvailable } = useAppState();
  const [showConfetti, setShowConfetti] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [choices, setChoices] = useState<Record<string, string>>({});

  const streakBounce = useRef(new Animated.Value(1)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const goalData = GOALS.find(g => g.id === goal);
  const metrics = useMemo(() => GOAL_METRICS[goal] || DEFAULT_METRICS, [goal]);
  const goalColor = useMemo(() => Colors.category[goal] || Colors.navy, [goal]);

  const userProducts = PRODUCTS.filter(p => products.includes(p.id));
  const allProducts = useMemo(() => {
    const custom = (customProducts || []).map(cp => ({
      id: cp.id,
      name: cp.name,
      tagline: cp.tagline,
      color: cp.color,
      goals: [] as string[],
    }));
    return [...userProducts, ...custom];
  }, [userProducts, customProducts]);

  const todayScores = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return dailyScores?.find(s => s.date === today);
  }, [dailyScores]);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  }, []);

  useEffect(() => {
    if (isCheckedInToday) {
      insightAnim.setValue(1);
    }
  }, [isCheckedInToday, insightAnim]);

  useEffect(() => {
    if (!isCheckedInToday) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 2000, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: Platform.OS !== 'web' }),
        ])
      ).start();
    }
  }, [isCheckedInToday, pulseAnim]);

  const allMetricsSet = useMemo(() => {
    return metrics.every(m => {
      if (m.type === 'choice') return !!choices[m.id];
      return (scores[m.id] ?? 0) > 0;
    });
  }, [metrics, scores, choices]);

  const filledCount = useMemo(() => {
    return metrics.filter(m => {
      if (m.type === 'choice') return !!choices[m.id];
      return (scores[m.id] ?? 0) > 0;
    }).length;
  }, [metrics, scores, choices]);

  const handleScoreChange = useCallback((metricId: string, value: number) => {
    setScores(prev => ({ ...prev, [metricId]: value }));
  }, []);

  const handleChoiceChange = useCallback((metricId: string, value: string) => {
    setChoices(prev => ({ ...prev, [metricId]: value }));
  }, []);

  const handleConfirmCheckIn = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const scoreMetrics = metrics.filter(m => m.type === 'score');
    const avgScore = scoreMetrics.length > 0
      ? Math.round(scoreMetrics.reduce((acc, m) => acc + (scores[m.id] ?? 3), 0) / scoreMetrics.length)
      : 3;

    checkIn({
      energy: scores[metrics[0]?.id] ?? avgScore,
      sleep: scores[metrics[1]?.id] ?? avgScore,
      mood: scores[metrics[2]?.id] ?? avgScore,
    });

    setShowConfetti(true);

    Animated.sequence([
      Animated.spring(streakBounce, { toValue: 1.35, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(streakBounce, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 10, stiffness: 180 }),
    ]).start();

    Animated.spring(insightAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 18,
      stiffness: 150,
      delay: 400,
    }).start();

    setTimeout(() => setShowConfetti(false), 2500);
  }, [scores, metrics, checkIn, streakBounce, insightAnim]);

  const confettiColors = ['#1A1F3C', '#4A90D9', '#D4A853', '#2E7D52', '#C4857A', '#7B8FC4'];
  const rewardMessage = getVariableReward(currentDay);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}{userName ? `, ${userName}` : ''}</Text>
            <Text style={styles.dayTitle}>Day {currentDay}</Text>
          </View>
          <Animated.View style={[styles.streakBadge, { transform: [{ scale: streakBounce }] }]}>
            <Flame size={16} color="#E67E22" fill="#E67E22" />
            <Text style={styles.streakNumber}>{currentStreak}</Text>
          </Animated.View>
        </View>

        {streakShieldAvailable && currentStreak >= 3 && !isCheckedInToday && (
          <View style={styles.shieldBanner}>
            <Shield size={16} color={Colors.deepBlue} strokeWidth={2} />
            <Text style={styles.shieldText}>Streak shield active — miss a day without losing your streak</Text>
          </View>
        )}

        {showConfetti && (
          <View style={styles.confettiContainer}>
            {Array.from({ length: 20 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 30}
                color={confettiColors[i % confettiColors.length]}
                startX={SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 60}
              />
            ))}
          </View>
        )}

        {!isCheckedInToday ? (
          <>
            <View style={[styles.goalBanner, { backgroundColor: goalColor + '12', borderColor: goalColor + '25' }]}>
              <View style={[styles.goalIconBubble, { backgroundColor: goalColor + '20' }]}>
                {goalData && ICON_MAP[goalData.icon] && React.createElement(ICON_MAP[goalData.icon], { size: 18, color: goalColor, strokeWidth: 2 })}
              </View>
              <View style={styles.goalBannerText}>
                <Text style={[styles.goalBannerTitle, { color: goalColor }]}>{goalData?.label ?? 'Daily'} Check-in</Text>
                <Text style={styles.goalBannerSub}>{filledCount}/{metrics.length} answered</Text>
              </View>
            </View>

            <View style={styles.metricsSection}>
              {metrics.map((metric, index) => {
                if (metric.type === 'choice') {
                  return (
                    <ChoiceMetricCard
                      key={metric.id}
                      metric={metric}
                      value={choices[metric.id] ?? ''}
                      onChange={(v) => handleChoiceChange(metric.id, v)}
                      index={index}
                    />
                  );
                }
                return (
                  <ScoreMetricCard
                    key={metric.id}
                    metric={metric}
                    value={scores[metric.id] ?? 0}
                    onChange={(v) => handleScoreChange(metric.id, v)}
                    index={index}
                  />
                );
              })}
            </View>

            <View style={styles.checkInSection}>
              <Animated.View style={!allMetricsSet ? { transform: [{ scale: pulseAnim }] } : undefined}>
                <TouchableOpacity
                  onPress={handleConfirmCheckIn}
                  style={[
                    styles.checkInButton,
                    allMetricsSet && styles.checkInButtonActive,
                  ]}
                  activeOpacity={0.85}
                  testID="confirm-check-in"
                  disabled={!allMetricsSet}
                >
                  <Text style={[
                    styles.checkInButtonText,
                    allMetricsSet && styles.checkInButtonTextActive,
                  ]}>
                    {allMetricsSet ? 'Log & check in' : `Answer all ${metrics.length} to continue`}
                  </Text>
                  {allMetricsSet && <ChevronRight size={18} color={Colors.white} strokeWidth={2.5} />}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.doneCard}>
              <View style={styles.doneIconContainer}>
                <CheckCircle size={48} color={Colors.success} strokeWidth={1.5} />
              </View>
              <Text style={styles.doneTitle}>All done for today</Text>
              <Text style={styles.doneSub}>Your {goalData?.label?.toLowerCase() ?? 'daily'} check-in is logged</Text>
            </View>

            {todayScores && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>TODAY'S CHECK-IN</Text>
                {metrics.map((metric, i) => {
                  const scoreKeys = ['energy', 'sleep', 'mood'] as const;
                  const scoreVal = todayScores.goalScores?.[metric.id]
                    ?? todayScores[scoreKeys[i] ?? 'energy']
                    ?? 3;
                  return (
                    <React.Fragment key={metric.id}>
                      <ScoreSummaryRow
                        metric={metric}
                        scoreValue={metric.type === 'score' ? scoreVal : undefined}
                        choiceValue={metric.type === 'choice' ? choices[metric.id] : undefined}
                      />
                      {i < metrics.length - 1 && <View style={styles.summaryDivider} />}
                    </React.Fragment>
                  );
                })}
              </View>
            )}

            <Animated.View
              style={[
                styles.rewardCard,
                {
                  opacity: insightAnim,
                  transform: [{
                    translateY: insightAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
                  }],
                },
              ]}
            >
              <Text style={styles.rewardEmoji}>✨</Text>
              <Text style={styles.rewardText}>{rewardMessage}</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.insightCard,
                {
                  opacity: insightAnim,
                  transform: [{
                    translateY: insightAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
                  }],
                },
              ]}
            >
              <Text style={styles.insightLabel}>DAY {currentDay} INSIGHT</Text>
              <Text style={styles.insightText}>{getDayInsight(currentDay)}</Text>
            </Animated.View>
          </>
        )}

        {allProducts.length > 0 && (
          <View style={styles.supplementsSection}>
            <Text style={styles.sectionLabel}>YOUR STACK</Text>
            {allProducts.map((product) => (
              <View key={product.id} style={styles.supplementRow}>
                <View style={[styles.supplementDot, { backgroundColor: product.color }]} />
                <View style={styles.supplementInfo}>
                  <Text style={styles.supplementName}>{product.name}</Text>
                  <Text style={styles.supplementTagline}>{product.tagline}</Text>
                </View>
                {isCheckedInToday && (
                  <CheckCircle size={20} color={Colors.success} strokeWidth={2} />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#1A1F3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    gap: 10,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cardHeaderText: {
    flex: 1,
  },
  question: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 15,
    color: Colors.navy,
    lineHeight: 20,
  },
  emoji: {
    fontSize: 22,
  },
  scaleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 6,
  },
  scaleTouchable: {
    flex: 1,
    alignItems: 'center' as const,
  },
  scaleCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cream,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scaleNumber: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 16,
    color: Colors.mediumGray,
  },
  labelRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  lowLabel: {
    fontFamily: Fonts.dmRegular,
    fontSize: 11,
    color: Colors.mediumGray,
  },
  highLabel: {
    fontFamily: Fonts.dmRegular,
    fontSize: 11,
    color: Colors.mediumGray,
  },
});

const choiceCardStyles = StyleSheet.create({
  optionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.cream,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 6,
  },
  optionEmoji: {
    fontSize: 16,
  },
  optionLabel: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 13,
    color: Colors.darkGray,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: Colors.mediumGray,
    letterSpacing: 0.2,
  },
  dayTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 26,
    color: Colors.navy,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: '#FFE8CC',
  },
  streakNumber: {
    fontFamily: Fonts.dmBold,
    fontSize: 17,
    color: '#E67E22',
  },
  shieldBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.blueBg,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  shieldText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.deepBlue,
    flex: 1,
    lineHeight: 16,
  },
  confettiContainer: {
    position: 'absolute' as const,
    top: 100,
    left: 0,
    right: 0,
    height: 220,
    zIndex: 10,
  },
  goalBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  goalIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  goalBannerText: {
    flex: 1,
  },
  goalBannerTitle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 16,
  },
  goalBannerSub: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.mediumGray,
    marginTop: 1,
  },
  metricsSection: {
    paddingHorizontal: 20,
  },
  checkInSection: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 8,
  },
  checkInButton: {
    backgroundColor: Colors.lightGray,
    height: 56,
    borderRadius: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 6,
  },
  checkInButtonActive: {
    backgroundColor: Colors.navy,
  },
  checkInButtonText: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 16,
    color: Colors.mediumGray,
  },
  checkInButtonTextActive: {
    color: Colors.white,
  },
  doneCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 32,
    alignItems: 'center' as const,
    shadowColor: '#1A1F3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  doneIconContainer: {
    marginBottom: 16,
  },
  doneTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 22,
    color: Colors.navy,
    textAlign: 'center' as const,
  },
  doneSub: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 4,
    textAlign: 'center' as const,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 18,
  },
  summaryTitle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 11,
    color: Colors.mediumGray,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  rewardCard: {
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 18,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE8CC',
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardText: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 15,
    color: '#8B6914',
    flex: 1,
    lineHeight: 22,
  },
  insightCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 18,
  },
  insightLabel: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 11,
    color: Colors.mediumGray,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  insightText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 24,
  },
  supplementsSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionLabel: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 11,
    color: Colors.mediumGray,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  supplementRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
    gap: 12,
  },
  supplementDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 14,
    color: Colors.navy,
  },
  supplementTagline: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.mediumGray,
    marginTop: 1,
  },
});
