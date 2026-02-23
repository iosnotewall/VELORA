import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, CheckCircle, Circle } from 'lucide-react-native';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { MILESTONES } from '@/constants/content';

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
    borderRadius: 4,
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

interface JourneyMilestone {
  day: number;
  label: string;
  completed: boolean;
  daysAway: number;
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { currentStreak, longestStreak, totalDaysTaken, checkInHistory, goal, currentDay } = useAppState();

  const milestoneData = MILESTONES[goal] || MILESTONES.energy;

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return checkInHistory.filter(d => d.startsWith(monthStr)).length;
  }, [checkInHistory]);

  const journeyMilestones: JourneyMilestone[] = useMemo(() => [
    { day: 7, label: milestoneData.d7, completed: totalDaysTaken >= 7, daysAway: Math.max(0, 7 - totalDaysTaken) },
    { day: 14, label: 'Building phase — your body is adapting.', completed: totalDaysTaken >= 14, daysAway: Math.max(0, 14 - totalDaysTaken) },
    { day: 21, label: milestoneData.d21, completed: totalDaysTaken >= 21, daysAway: Math.max(0, 21 - totalDaysTaken) },
    { day: 30, label: milestoneData.d30, completed: totalDaysTaken >= 30, daysAway: Math.max(0, 30 - totalDaysTaken) },
    { day: 60, label: 'Mastery — consistency is second nature.', completed: totalDaysTaken >= 60, daysAway: Math.max(0, 60 - totalDaysTaken) },
    { day: 90, label: 'New baseline — this is who you are now.', completed: totalDaysTaken >= 90, daysAway: Math.max(0, 90 - totalDaysTaken) },
  ], [totalDaysTaken, milestoneData]);

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
            <Text style={styles.bestStreak}>Best: {longestStreak} days</Text>
          </View>
          <View style={styles.streakStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalDaysTaken}</Text>
              <Text style={styles.statLabel}>Total Taken</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{thisMonthCount}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.max(0, 30 - totalDaysTaken)}</Text>
              <Text style={styles.statLabel}>Days to Goal</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR HISTORY</Text>
          <View style={styles.calendarCard}>
            <CalendarHeatmap checkInHistory={checkInHistory} />
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
    borderRadius: 20,
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
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  streakNumber: {
    fontFamily: Fonts.playfairBold,
    fontSize: 42,
    color: Colors.white,
    marginTop: 2,
  },
  bestStreak: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  streakStats: {
    flexDirection: 'row' as const,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
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
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 12,
    color: Colors.mediumGray,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  calendarCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  journeyRow: {
    flexDirection: 'row' as const,
    gap: 14,
    marginBottom: 0,
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
