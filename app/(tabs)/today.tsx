import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, CheckCircle, Moon as MoonIcon, Zap, BedDouble, Smile, Shield, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { PRODUCTS } from '@/constants/products';
import { GOALS, getDayInsight, getVariableReward, SCORE_LABELS } from '@/constants/content';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SCORE_COLORS: Record<number, string> = {
  1: '#E57373',
  2: '#FFB74D',
  3: '#FFD54F',
  4: '#81C784',
  5: '#4CAF50',
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

function ScoreSelector({
  label,
  icon,
  value,
  onChange,
  accentColor,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  accentColor: string;
}) {
  const scaleAnims = useRef([1, 2, 3, 4, 5].map(() => new Animated.Value(1))).current;

  const handleSelect = useCallback((score: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scaleAnims[score - 1], { toValue: 1.3, useNativeDriver: Platform.OS !== 'web', speed: 80, bounciness: 0 }),
      Animated.spring(scaleAnims[score - 1], { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 10, stiffness: 200 }),
    ]).start();
    onChange(score);
  }, [onChange, scaleAnims]);

  return (
    <View style={scoreStyles.container}>
      <View style={scoreStyles.labelRow}>
        {icon}
        <Text style={scoreStyles.label}>{label}</Text>
        {value > 0 && (
          <Text style={[scoreStyles.valueText, { color: SCORE_COLORS[value] }]}>
            {SCORE_LABELS[value]}
          </Text>
        )}
      </View>
      <View style={scoreStyles.dotsRow}>
        {[1, 2, 3, 4, 5].map((score) => {
          const isSelected = value >= score;
          return (
            <TouchableOpacity
              key={score}
              onPress={() => handleSelect(score)}
              activeOpacity={0.7}
              testID={`score-${label.toLowerCase()}-${score}`}
            >
              <Animated.View
                style={[
                  scoreStyles.dot,
                  {
                    backgroundColor: isSelected ? (SCORE_COLORS[score]) : Colors.lightGray,
                    borderColor: isSelected ? SCORE_COLORS[score] : Colors.border,
                    transform: [{ scale: scaleAnims[score - 1] }],
                  },
                ]}
              >
                <Text style={[scoreStyles.dotText, isSelected && scoreStyles.dotTextActive]}>
                  {score}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 15,
    color: Colors.navy,
    flex: 1,
  },
  valueText: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 13,
  },
  dotsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 8,
  },
  dot: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dotText: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 16,
    color: Colors.mediumGray,
  },
  dotTextActive: {
    color: Colors.white,
  },
});

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { goal, products, customProducts, currentStreak, currentDay, isCheckedInToday, checkIn, userName, dailyScores, streakShieldAvailable } = useAppState();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showScoring, setShowScoring] = useState(false);
  const [energyScore, setEnergyScore] = useState(0);
  const [sleepScore, setSleepScore] = useState(0);
  const [moodScore, setMoodScore] = useState(0);

  const checkAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;
  const streakBounce = useRef(new Animated.Value(1)).current;
  const scoringAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringProgress = useRef(new Animated.Value(0)).current;

  const goalData = GOALS.find(g => g.id === goal);
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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if (isCheckedInToday) {
      checkAnim.setValue(1);
      ringProgress.setValue(1);
    }
  }, [isCheckedInToday, checkAnim, ringProgress]);

  useEffect(() => {
    if (!isCheckedInToday) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 1800, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: Platform.OS !== 'web' }),
        ])
      ).start();
    }
  }, [isCheckedInToday, pulseAnim]);

  const handleCheckInPress = useCallback(() => {
    if (isCheckedInToday) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.spring(buttonScaleAnim, { toValue: 0.94, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(buttonScaleAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 15, stiffness: 200 }),
    ]).start();

    setShowScoring(true);
    Animated.spring(scoringAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 20,
      stiffness: 180,
    }).start();
  }, [isCheckedInToday, buttonScaleAnim, scoringAnim]);

  const handleConfirmCheckIn = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    checkIn({
      energy: energyScore || 3,
      sleep: sleepScore || 3,
      mood: moodScore || 3,
    });

    setShowConfetti(true);
    setShowScoring(false);

    Animated.spring(checkAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 18,
      stiffness: 200,
    }).start();

    Animated.timing(ringProgress, {
      toValue: 1,
      duration: 800,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    Animated.sequence([
      Animated.spring(streakBounce, { toValue: 1.35, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(streakBounce, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 10, stiffness: 180 }),
    ]).start();

    Animated.spring(insightAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 18,
      stiffness: 150,
      delay: 500,
    }).start();

    setTimeout(() => setShowConfetti(false), 2500);
  }, [energyScore, sleepScore, moodScore, checkIn, checkAnim, ringProgress, streakBounce, insightAnim]);

  const handleSkipScoring = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkIn({ energy: 3, sleep: 3, mood: 3 });
    setShowConfetti(true);
    setShowScoring(false);

    Animated.spring(checkAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 18, stiffness: 200 }).start();
    Animated.timing(ringProgress, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }).start();
    Animated.sequence([
      Animated.spring(streakBounce, { toValue: 1.35, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(streakBounce, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 10, stiffness: 180 }),
    ]).start();
    Animated.spring(insightAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 18, stiffness: 150, delay: 500 }).start();

    setTimeout(() => setShowConfetti(false), 2500);
  }, [checkIn, checkAnim, ringProgress, streakBounce, insightAnim]);

  const allScoresSet = energyScore > 0 && sleepScore > 0 && moodScore > 0;
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
            <Text style={styles.shieldText}>Streak shield available — miss a day without losing your streak</Text>
          </View>
        )}

        <View style={styles.heroCard}>
          {showConfetti && (
            <View style={styles.confettiContainer}>
              {Array.from({ length: 20 }).map((_, i) => (
                <ConfettiParticle
                  key={i}
                  delay={i * 30}
                  color={confettiColors[i % confettiColors.length]}
                  startX={(SCREEN_WIDTH - 40) / 2 + (Math.random() - 0.5) * 60}
                />
              ))}
            </View>
          )}

          {!showScoring ? (
            <>
              <Animated.View style={[
                styles.statusRing,
                isCheckedInToday && styles.statusRingDone,
                !isCheckedInToday && { transform: [{ scale: pulseAnim }] },
              ]}>
                <View style={[
                  styles.statusCircleInner,
                  isCheckedInToday && styles.statusCircleInnerDone,
                ]}>
                  {isCheckedInToday ? (
                    <Animated.View style={{ opacity: checkAnim }}>
                      <CheckCircle size={44} color={Colors.white} strokeWidth={1.5} />
                    </Animated.View>
                  ) : (
                    <Text style={styles.tapText}>Tap</Text>
                  )}
                </View>
              </Animated.View>

              <Text style={[styles.statusText, isCheckedInToday && styles.statusTextDone]}>
                {isCheckedInToday ? 'Done for today ✓' : 'Did you take your supplements?'}
              </Text>

              {!isCheckedInToday ? (
                <Animated.View style={{ transform: [{ scale: buttonScaleAnim }], width: '100%' }}>
                  <TouchableOpacity
                    onPress={handleCheckInPress}
                    style={styles.checkInButton}
                    activeOpacity={0.85}
                    testID="check-in-button"
                  >
                    <Text style={styles.checkInButtonText}>I took my supplements</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <View style={styles.doneSection}>
                  <MoonIcon size={18} color={Colors.mediumGray} strokeWidth={1.5} />
                  <Text style={styles.doneText}>See you tomorrow</Text>
                </View>
              )}
            </>
          ) : (
            <Animated.View style={[
              styles.scoringSection,
              {
                opacity: scoringAnim,
                transform: [{
                  translateY: scoringAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
                }],
              },
            ]}>
              <Text style={styles.scoringTitle}>How are you feeling?</Text>
              <Text style={styles.scoringSub}>Quick check-in — takes 3 taps</Text>

              <View style={styles.scoringDivider} />

              <ScoreSelector
                label="Energy"
                icon={<Zap size={18} color="#FFB74D" strokeWidth={2} />}
                value={energyScore}
                onChange={setEnergyScore}
                accentColor="#FFB74D"
              />
              <ScoreSelector
                label="Sleep"
                icon={<BedDouble size={18} color="#7B8FC4" strokeWidth={2} />}
                value={sleepScore}
                onChange={setSleepScore}
                accentColor="#7B8FC4"
              />
              <ScoreSelector
                label="Mood"
                icon={<Smile size={18} color="#81C784" strokeWidth={2} />}
                value={moodScore}
                onChange={setMoodScore}
                accentColor="#81C784"
              />

              <TouchableOpacity
                onPress={handleConfirmCheckIn}
                style={[styles.confirmButton, allScoresSet && styles.confirmButtonActive]}
                activeOpacity={0.85}
                testID="confirm-check-in"
              >
                <Text style={[styles.confirmButtonText, allScoresSet && styles.confirmButtonTextActive]}>
                  {allScoresSet ? 'Log & check in' : 'Rate all three to continue'}
                </Text>
                {allScoresSet && <ChevronRight size={18} color={Colors.white} strokeWidth={2.5} />}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSkipScoring} style={styles.skipButton} testID="skip-scoring">
                <Text style={styles.skipText}>Skip scoring</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {isCheckedInToday && (
          <Animated.View
            style={[
              styles.rewardCard,
              {
                opacity: insightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                transform: [{
                  translateY: insightAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
                }],
              },
            ]}
          >
            <Text style={styles.rewardEmoji}>✨</Text>
            <Text style={styles.rewardText}>{rewardMessage}</Text>
          </Animated.View>
        )}

        {isCheckedInToday && todayScores && (
          <View style={styles.todayScoresCard}>
            <Text style={styles.todayScoresTitle}>TODAY'S CHECK-IN</Text>
            <View style={styles.todayScoresRow}>
              {[
                { label: 'Energy', value: todayScores.energy, icon: <Zap size={16} color="#FFB74D" strokeWidth={2} /> },
                { label: 'Sleep', value: todayScores.sleep, icon: <BedDouble size={16} color="#7B8FC4" strokeWidth={2} /> },
                { label: 'Mood', value: todayScores.mood, icon: <Smile size={16} color="#81C784" strokeWidth={2} /> },
              ].map((item) => (
                <View key={item.label} style={styles.todayScoreItem}>
                  {item.icon}
                  <Text style={styles.todayScoreValue}>{item.value}/5</Text>
                  <Text style={styles.todayScoreLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {isCheckedInToday && (
          <Animated.View
            style={[
              styles.insightCard,
              {
                opacity: insightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                transform: [{
                  translateY: insightAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
                }],
              },
            ]}
          >
            <Text style={styles.insightLabel}>DAY {currentDay} INSIGHT</Text>
            <Text style={styles.insightText}>{getDayInsight(currentDay)}</Text>
          </Animated.View>
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

        {goalData && (
          <View style={styles.goalCard}>
            <Text style={styles.goalCardLabel}>YOUR GOAL</Text>
            <Text style={styles.goalCardTitle}>{goalData.label}</Text>
            <Text style={styles.goalCardSub}>{goalData.sub}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
    marginBottom: 12,
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
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 28,
    alignItems: 'center' as const,
    shadowColor: '#1A1F3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    overflow: 'hidden' as const,
  },
  confettiContainer: {
    position: 'absolute' as const,
    top: 20,
    left: 0,
    right: 0,
    height: 220,
    zIndex: 10,
  },
  statusRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: Colors.lightGray,
    borderStyle: 'dashed' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 18,
  },
  statusRingDone: {
    borderWidth: 0,
  },
  statusCircleInner: {
    width: 118,
    height: 118,
    borderRadius: 59,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.cream,
  },
  statusCircleInnerDone: {
    backgroundColor: Colors.navy,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  tapText: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 20,
    color: Colors.navy,
    letterSpacing: 1,
  },
  statusText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  statusTextDone: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 17,
    color: Colors.navy,
  },
  checkInButton: {
    backgroundColor: Colors.navy,
    height: 56,
    borderRadius: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkInButtonText: {
    fontFamily: Fonts.dmBold,
    fontSize: 17,
    color: Colors.white,
  },
  doneSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  doneText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 15,
    color: Colors.mediumGray,
  },
  scoringSection: {
    width: '100%',
  },
  scoringTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 22,
    color: Colors.navy,
    textAlign: 'center' as const,
  },
  scoringSub: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    marginTop: 4,
  },
  scoringDivider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 20,
  },
  confirmButton: {
    backgroundColor: Colors.lightGray,
    height: 54,
    borderRadius: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 6,
    marginTop: 4,
  },
  confirmButtonActive: {
    backgroundColor: Colors.navy,
  },
  confirmButtonText: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 16,
    color: Colors.mediumGray,
  },
  confirmButtonTextActive: {
    color: Colors.white,
  },
  skipButton: {
    alignItems: 'center' as const,
    paddingVertical: 14,
    marginTop: 2,
  },
  skipText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: Colors.mediumGray,
    textDecorationLine: 'underline' as const,
  },
  rewardCard: {
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
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
  todayScoresCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 20,
  },
  todayScoresTitle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 11,
    color: Colors.mediumGray,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  todayScoresRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
  },
  todayScoreItem: {
    alignItems: 'center' as const,
    gap: 6,
  },
  todayScoreValue: {
    fontFamily: Fonts.dmBold,
    fontSize: 20,
    color: Colors.navy,
  },
  todayScoreLabel: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.mediumGray,
  },
  insightCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 20,
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
  goalCard: {
    backgroundColor: Colors.blueBg,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
  },
  goalCardLabel: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 11,
    color: Colors.deepBlue,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  goalCardTitle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  goalCardSub: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 2,
  },
});
