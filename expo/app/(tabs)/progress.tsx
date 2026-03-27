import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Platform, TouchableOpacity, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, CheckCircle, Circle, Zap, BedDouble, Smile, Award, Share2, TrendingUp, Calendar, Moon, Sunrise, Clock, Brain, Target, Lightbulb, Leaf, Wind, Shield, Heart, Thermometer, Sparkles, RotateCcw, Dumbbell, Activity, BatteryLow, Cookie, Utensils } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppState, DailyScore } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { MILESTONES, SCORE_LABELS, GOAL_METRICS, DEFAULT_METRICS } from '@/constants/content';

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function CalendarHeatmap({ checkInHistory }: { checkInHistory: string[] }) {
  const weeks = useMemo(() => {
    const today = new Date();
    const result: { date: string; status: 'taken' | 'missed' | 'today' | 'future' | 'empty' }[][] = [];
    const historySet = new Set(checkInHistory);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (8 * 7 - 1));

    const dayOfWeek = startDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + mondayOffset);

    for (let week = 0; week < 8; week++) {
      const weekDays: typeof result[0] = [];
      for (let day = 0; day < 7; day++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + week * 7 + day);
        const dateStr = d.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        let status: 'taken' | 'missed' | 'today' | 'future' | 'empty';
        if (dateStr === todayStr) {
          status = historySet.has(dateStr) ? 'taken' : 'today';
        } else if (d > today) {
          status = 'future';
        } else if (historySet.has(dateStr)) {
          status = 'taken';
        } else {
          const firstCheckIn = checkInHistory[0];
          if (firstCheckIn && dateStr >= firstCheckIn) {
            status = 'missed';
          } else {
            status = 'empty';
          }
        }
        weekDays.push({ date: dateStr, status });
      }
      result.push(weekDays);
    }
    return result;
  }, [checkInHistory]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View>
      <View style={calStyles.dayLabels}>
        {DAYS_OF_WEEK.map((d, i) => (
          <Text key={i} style={calStyles.dayLabel}>{d}</Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={calStyles.weekRow}>
          {week.map((day, di) => {
            const isToday = day.date === todayStr;
            return (
              <View
                key={di}
                style={[
                  calStyles.cell,
                  day.status === 'taken' && calStyles.cellTaken,
                  day.status === 'missed' && calStyles.cellMissed,
                  day.status === 'today' && calStyles.cellToday,
                  day.status === 'future' && calStyles.cellFuture,
                  day.status === 'empty' && calStyles.cellEmpty,
                  isToday && calStyles.cellCurrentDay,
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const calStyles = StyleSheet.create({
  dayLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  dayLabel: {
    fontFamily: Fonts.dmRegular,
    fontSize: 11,
    color: Colors.mediumGray,
    width: 32,
    textAlign: 'center' as const,
  },
  weekRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  cell: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  cellTaken: {
    backgroundColor: Colors.navy,
  },
  cellMissed: {
    backgroundColor: '#F5DDD9',
  },
  cellToday: {
    backgroundColor: Colors.blueBg,
  },
  cellFuture: {
    backgroundColor: 'transparent',
  },
  cellEmpty: {
    backgroundColor: Colors.lightGray,
  },
  cellCurrentDay: {
    borderWidth: 2,
    borderColor: Colors.navy,
  },
});

function MiniBarChart({ scores, metricKey, color, label }: {
  scores: DailyScore[];
  metricKey: 'energy' | 'sleep' | 'mood';
  color: string;
  label: string;
}) {
  const last7 = useMemo(() => {
    const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-7);
  }, [scores]);

  const avg = useMemo(() => {
    if (last7.length === 0) return 0;
    const sum = last7.reduce((acc, s) => acc + s[metricKey], 0);
    return Math.round((sum / last7.length) * 10) / 10;
  }, [last7, metricKey]);

  const barAnims = useRef(last7.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = last7.map((_, i) =>
      Animated.timing(barAnims[i] || new Animated.Value(0), {
        toValue: 1,
        duration: 500,
        delay: i * 60,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    Animated.stagger(60, anims).start();
  }, [last7, barAnims]);

  if (last7.length === 0) {
    return (
      <View style={chartStyles.container}>
        <View style={chartStyles.header}>
          <Text style={chartStyles.label}>{label}</Text>
          <Text style={[chartStyles.avg, { color }]}>—</Text>
        </View>
        <View style={chartStyles.emptyState}>
          <Text style={chartStyles.emptyText}>Check in to see trends</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.header}>
        <Text style={chartStyles.label}>{label}</Text>
        <Text style={[chartStyles.avg, { color }]}>{avg}</Text>
      </View>
      <View style={chartStyles.barsContainer}>
        {last7.map((score, i) => {
          const height = (score[metricKey] / 5) * 48;
          return (
            <View key={score.date} style={chartStyles.barColumn}>
              <View style={chartStyles.barTrack}>
                <Animated.View
                  style={[
                    chartStyles.bar,
                    {
                      backgroundColor: color,
                      height,
                      opacity: barAnims[i]
                        ? barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] })
                        : 1,
                      maxHeight: barAnims[i]
                        ? barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, height] })
                        : height,
                    },
                  ]}
                />
              </View>
              <Text style={chartStyles.dayText}>
                {new Date(score.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' })}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  label: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 14,
    color: Colors.navy,
  },
  avg: {
    fontFamily: Fonts.dmBold,
    fontSize: 18,
  },
  barsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
    height: 64,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center' as const,
  },
  barTrack: {
    height: 48,
    justifyContent: 'flex-end' as const,
  },
  bar: {
    width: 20,
    borderRadius: 6,
    minHeight: 4,
  },
  dayText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 10,
    color: Colors.mediumGray,
    marginTop: 4,
  },
  emptyState: {
    height: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emptyText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: Colors.mediumGray,
  },
});

function ResultsCard({ userName, totalDays, currentStreak, goal, avgEnergy, avgSleep, avgMood }: {
  userName: string;
  totalDays: number;
  currentStreak: number;
  goal: string;
  avgEnergy: number;
  avgSleep: number;
  avgMood: number;
}) {
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 20,
      stiffness: 150,
    }).start();
  }, [cardAnim]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `🏆 ${userName}'s ${totalDays}-Day Results\n\n🔥 ${currentStreak}-day streak\n⚡ Energy: ${avgEnergy}/5\n😴 Sleep: ${avgSleep}/5\n😊 Mood: ${avgMood}/5\n\nBuilt with Velora — the supplement consistency app.`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  }, [userName, totalDays, currentStreak, avgEnergy, avgSleep, avgMood]);

  return (
    <Animated.View style={[
      resultsStyles.card,
      {
        opacity: cardAnim,
        transform: [{ scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
      },
    ]}>
      <View style={resultsStyles.cardHeader}>
        <Award size={24} color={Colors.gold} strokeWidth={1.5} />
        <Text style={resultsStyles.cardTitle}>{totalDays}-Day Results</Text>
      </View>

      <Text style={resultsStyles.cardName}>{userName || 'Your'} journey</Text>

      <View style={resultsStyles.statsGrid}>
        <View style={resultsStyles.statBox}>
          <Flame size={20} color="#E67E22" fill="#E67E22" />
          <Text style={resultsStyles.statValue}>{currentStreak}</Text>
          <Text style={resultsStyles.statLabel}>Day Streak</Text>
        </View>
        <View style={resultsStyles.statBox}>
          <Zap size={20} color="#FFB74D" strokeWidth={2} />
          <Text style={resultsStyles.statValue}>{avgEnergy}</Text>
          <Text style={resultsStyles.statLabel}>Avg Energy</Text>
        </View>
        <View style={resultsStyles.statBox}>
          <BedDouble size={20} color="#7B8FC4" strokeWidth={2} />
          <Text style={resultsStyles.statValue}>{avgSleep}</Text>
          <Text style={resultsStyles.statLabel}>Avg Sleep</Text>
        </View>
        <View style={resultsStyles.statBox}>
          <Smile size={20} color="#81C784" strokeWidth={2} />
          <Text style={resultsStyles.statValue}>{avgMood}</Text>
          <Text style={resultsStyles.statLabel}>Avg Mood</Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleShare} style={resultsStyles.shareButton} activeOpacity={0.8}>
        <Share2 size={18} color={Colors.white} strokeWidth={2} />
        <Text style={resultsStyles.shareText}>Share my results</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const resultsStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.navy,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  cardName: {
    fontFamily: Fonts.playfairBold,
    fontSize: 28,
    color: Colors.white,
    marginTop: 8,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 20,
  },
  statBox: {
    width: '47%' as any,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center' as const,
    gap: 6,
  },
  statValue: {
    fontFamily: Fonts.dmBold,
    fontSize: 24,
    color: Colors.white,
  },
  statLabel: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  shareButton: {
    backgroundColor: Colors.deepBlue,
    borderRadius: 100,
    height: 48,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  shareText: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 15,
    color: Colors.white,
  },
});

interface JourneyMilestone {
  day: number;
  label: string;
  completed: boolean;
  daysAway: number;
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { currentStreak, longestStreak, totalDaysTaken, checkInHistory, goal, currentDay, dailyScores, userName } = useAppState();

  const goalMetrics = useMemo(() => GOAL_METRICS[goal] || DEFAULT_METRICS, [goal]);

  const milestoneData = MILESTONES[goal] || MILESTONES.energy;

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return checkInHistory.filter(d => d.startsWith(monthStr)).length;
  }, [checkInHistory]);

  const scores = dailyScores || [];

  const averages = useMemo(() => {
    if (scores.length === 0) return { energy: 0, sleep: 0, mood: 0 };
    const sum = scores.reduce((acc, s) => ({
      energy: acc.energy + s.energy,
      sleep: acc.sleep + s.sleep,
      mood: acc.mood + s.mood,
    }), { energy: 0, sleep: 0, mood: 0 });
    return {
      energy: Math.round((sum.energy / scores.length) * 10) / 10,
      sleep: Math.round((sum.sleep / scores.length) * 10) / 10,
      mood: Math.round((sum.mood / scores.length) * 10) / 10,
    };
  }, [scores]);

  const showResultsCard = totalDaysTaken >= 7;

  const journeyMilestones: JourneyMilestone[] = useMemo(() => [
    { day: 7, label: milestoneData.d7, completed: totalDaysTaken >= 7, daysAway: Math.max(0, 7 - totalDaysTaken) },
    { day: 14, label: 'Building phase — your body is adapting.', completed: totalDaysTaken >= 14, daysAway: Math.max(0, 14 - totalDaysTaken) },
    { day: 21, label: milestoneData.d21, completed: totalDaysTaken >= 21, daysAway: Math.max(0, 21 - totalDaysTaken) },
    { day: 30, label: milestoneData.d30, completed: totalDaysTaken >= 30, daysAway: Math.max(0, 30 - totalDaysTaken) },
    { day: 60, label: 'Mastery — consistency is second nature.', completed: totalDaysTaken >= 60, daysAway: Math.max(0, 60 - totalDaysTaken) },
    { day: 90, label: 'New baseline — this is who you are now.', completed: totalDaysTaken >= 90, daysAway: Math.max(0, 90 - totalDaysTaken) },
  ], [totalDaysTaken, milestoneData]);

  const consistencyRate = useMemo(() => {
    if (checkInHistory.length === 0) return 0;
    const firstDate = new Date(checkInHistory[0] + 'T12:00:00');
    const today = new Date();
    const daysBetween = Math.max(1, Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return Math.round((checkInHistory.length / daysBetween) * 100);
  }, [checkInHistory]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Progress</Text>

        <View style={styles.streakCard}>
          <View style={styles.streakTop}>
            <View>
              <Flame size={28} color="#FFA726" fill="#FFA726" />
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Text style={styles.streakNumber}>{currentStreak} days</Text>
            </View>
            <View style={styles.consistencyBadge}>
              <Text style={styles.consistencyValue}>{consistencyRate}%</Text>
              <Text style={styles.consistencyLabel}>Consistency</Text>
            </View>
          </View>
          <View style={styles.streakStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalDaysTaken}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{thisMonthCount}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {showResultsCard && (
          <View style={styles.section}>
            <ResultsCard
              userName={userName}
              totalDays={totalDaysTaken}
              currentStreak={currentStreak}
              goal={goal}
              avgEnergy={averages.energy}
              avgSleep={averages.sleep}
              avgMood={averages.mood}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={16} color={Colors.navy} strokeWidth={2} />
            <Text style={styles.sectionTitle}>SCORE TRENDS</Text>
          </View>
          <MiniBarChart scores={scores} metricKey="energy" color={goalMetrics[0]?.color ?? '#FFB74D'} label={goalMetrics[0]?.label ?? 'Energy'} />
          <MiniBarChart scores={scores} metricKey="sleep" color={goalMetrics[1]?.color ?? '#7B8FC4'} label={goalMetrics[1]?.label ?? 'Sleep'} />
          <MiniBarChart scores={scores} metricKey="mood" color={goalMetrics[2]?.color ?? '#81C784'} label={goalMetrics[2]?.label ?? 'Mood'} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={16} color={Colors.navy} strokeWidth={2} />
            <Text style={styles.sectionTitle}>YOUR HISTORY</Text>
          </View>
          <View style={styles.calendarCard}>
            <CalendarHeatmap checkInHistory={checkInHistory} />
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.navy }]} />
                <Text style={styles.legendText}>Taken</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F5DDD9' }]} />
                <Text style={styles.legendText}>Missed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.blueBg, borderWidth: 1, borderColor: Colors.navy }]} />
                <Text style={styles.legendText}>Today</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR JOURNEY</Text>
          {journeyMilestones.map((m, index) => (
            <View key={m.day} style={styles.journeyRow}>
              <View style={styles.journeyLeft}>
                {m.completed ? (
                  <CheckCircle size={28} color={Colors.success} fill={Colors.successBg} strokeWidth={2} />
                ) : (
                  <Circle size={28} color={Colors.lightGray} strokeWidth={2} />
                )}
                {index < journeyMilestones.length - 1 && (
                  <View style={[styles.journeyLine, m.completed && styles.journeyLineCompleted]} />
                )}
              </View>
              <View style={styles.journeyContent}>
                <Text style={[styles.journeyDay, m.completed && styles.journeyDayCompleted]}>Day {m.day}</Text>
                <Text style={styles.journeyLabel}>{m.label}</Text>
                {!m.completed && m.daysAway > 0 && (
                  <Text style={styles.journeyAway}>{m.daysAway} days away</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.weeklyInsight}>
          <View style={styles.weeklyInsightBorder} />
          <Text style={styles.weeklyInsightText}>
            {currentDay <= 7
              ? "This week's focus: Build the habit. Show up every day, no matter what."
              : currentDay <= 21
              ? "You're in the building phase. Your body is accumulating the compounds it needs. Stay consistent."
              : "You've crossed the threshold. The results you feel now are yours to keep — as long as you continue."}
          </Text>
        </View>
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
  screenTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 28,
    color: Colors.navy,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  streakCard: {
    backgroundColor: Colors.navy,
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 24,
  },
  streakTop: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 20,
  },
  streakLabel: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  streakNumber: {
    fontFamily: Fonts.playfairBold,
    fontSize: 42,
    color: Colors.white,
    marginTop: 2,
  },
  consistencyBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center' as const,
  },
  consistencyValue: {
    fontFamily: Fonts.dmBold,
    fontSize: 20,
    color: Colors.white,
  },
  consistencyLabel: {
    fontFamily: Fonts.dmRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  streakStats: {
    flexDirection: 'row' as const,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statNumber: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 18,
    color: Colors.white,
  },
  statLabel: {
    fontFamily: Fonts.dmRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 12,
    color: Colors.mediumGray,
    letterSpacing: 0.8,
  },
  calendarCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  calendarLegend: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 20,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  legendItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 11,
    color: Colors.mediumGray,
  },
  journeyRow: {
    flexDirection: 'row' as const,
    gap: 14,
  },
  journeyLeft: {
    alignItems: 'center' as const,
    width: 28,
  },
  journeyLine: {
    width: 2,
    height: 48,
    backgroundColor: Colors.lightGray,
  },
  journeyLineCompleted: {
    backgroundColor: Colors.success,
  },
  journeyContent: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 2,
  },
  journeyDay: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 14,
    color: Colors.mediumGray,
  },
  journeyDayCompleted: {
    color: Colors.success,
  },
  journeyLabel: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: Colors.darkGray,
    lineHeight: 20,
    marginTop: 2,
  },
  journeyAway: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.mediumGray,
    marginTop: 4,
    fontStyle: 'italic' as const,
  },
  weeklyInsight: {
    flexDirection: 'row' as const,
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.cream,
    borderRadius: 12,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weeklyInsightBorder: {
    width: 4,
    backgroundColor: Colors.blue,
  },
  weeklyInsightText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 22,
    padding: 16,
    flex: 1,
  },
});
