import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Clock, Pill, Target, CreditCard, RotateCcw, BookOpen, HelpCircle, Mail, Star, RefreshCw, Bell, BellOff, Shuffle, Timer, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppState, NotificationMode } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS, NOTIFICATION_MODE_OPTIONS } from '@/constants/content';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingsRow({ icon, label, value, onPress, rightElement }: SettingsRowProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsRow} activeOpacity={onPress ? 0.6 : 1}>
      <View style={styles.settingsRowLeft}>
        {icon}
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <View style={styles.settingsRowRight}>
        {rightElement}
        {value && <Text style={styles.settingsValue}>{value}</Text>}
        {onPress && <ChevronRight size={18} color={Colors.mediumGray} />}
      </View>
    </TouchableOpacity>
  );
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  specific: <Clock size={20} color={Colors.navy} strokeWidth={1.5} />,
  random: <Shuffle size={20} color={Colors.navy} strokeWidth={1.5} />,
  hourly: <Timer size={20} color={Colors.navy} strokeWidth={1.5} />,
};

const NOTIFICATION_MODE_LABELS: Record<NotificationMode, string> = {
  specific: 'Set times',
  random: 'Random daily',
  hourly: 'Hourly nudges',
};

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userName, goal, routineTime, products, currentDay, totalDaysTaken, notificationsEnabled, notificationMode, notificationTimes, streakShieldAvailable, updateState } = useAppState();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);

  const router = useRouter();
  const goalData = GOALS.find(g => g.id === goal);
  const productCount = products.length;
  const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  const handleToggleNotifications = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateState({ notificationsEnabled: !notificationsEnabled });
  }, [notificationsEnabled, updateState]);

  const handleSetNotificationMode = useCallback((mode: NotificationMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateState({ notificationMode: mode });
    if (mode === 'specific') {
      setShowTimeSelector(true);
    } else {
      setShowTimeSelector(false);
    }
  }, [updateState]);

  const handleToggleTime = useCallback((time: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = notificationTimes || ['08:00'];
    const exists = current.includes(time);
    if (exists && current.length === 1) return;
    const updated = exists ? current.filter(t => t !== time) : [...current, time].sort();
    updateState({ notificationTimes: updated });
  }, [notificationTimes, updateState]);

  const handleResetOnboarding = useCallback(() => {
    Alert.alert(
      'Reset App',
      'This will clear all your data and restart the onboarding. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' as const },
        {
          text: 'Reset',
          style: 'destructive' as const,
          onPress: () => {
            updateState({
              goal: '',
              gapScore: 0,
              products: [],
              routineTime: '08:00',
              userName: '',
              currentStreak: 0,
              longestStreak: 0,
              totalDaysTaken: 0,
              lastCheckedIn: null,
              checkInHistory: [],
              onboardingComplete: false,
              notificationsEnabled: false,
              frequency: 0,
              friction: '',
              energyLevel: 0,
              commitmentLevel: '',
              dailyScores: [],
              streakShieldAvailable: true,
              streakShieldUsedDate: null,
              notificationMode: 'specific',
              notificationTimes: ['08:00'],
            });
          },
        },
      ]
    );
  }, [updateState]);

  const notifModeLabel = NOTIFICATION_MODE_LABELS[notificationMode || 'specific'];
  const timesLabel = (notificationTimes || ['08:00']).join(', ');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{userName || 'Your'} routine</Text>
          <Text style={styles.profileSub}>
            {goalData?.label || 'Wellness'} · Day {currentDay}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>MY ROUTINE</Text>
          <SettingsRow
            icon={<Clock size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="Reminder time"
            value={routineTime}
          />
          <SettingsRow
            icon={<Pill size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="My supplements"
            value={`${productCount} item${productCount !== 1 ? 's' : ''}`}
          />
          <SettingsRow
            icon={<Target size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="My goal"
            value={goalData?.label || 'Not set'}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

          <TouchableOpacity
            onPress={handleToggleNotifications}
            style={styles.notifToggleRow}
            activeOpacity={0.7}
          >
            <View style={styles.settingsRowLeft}>
              {notificationsEnabled
                ? <Bell size={20} color={Colors.navy} strokeWidth={1.5} />
                : <BellOff size={20} color={Colors.mediumGray} strokeWidth={1.5} />
              }
              <Text style={styles.settingsLabel}>Push notifications</Text>
            </View>
            <View style={[styles.toggle, notificationsEnabled && styles.toggleActive]}>
              <View style={[styles.toggleKnob, notificationsEnabled && styles.toggleKnobActive]} />
            </View>
          </TouchableOpacity>

          {notificationsEnabled && (
            <>
              <View style={styles.notifDivider} />
              <Text style={styles.notifModeTitle}>Notification style</Text>

              {NOTIFICATION_MODE_OPTIONS.map((option) => {
                const isActive = (notificationMode || 'specific') === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleSetNotificationMode(option.id as NotificationMode)}
                    style={[styles.modeRow, isActive && styles.modeRowActive]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.modeRadio, isActive && styles.modeRadioActive]}>
                      {isActive && <View style={styles.modeRadioDot} />}
                    </View>
                    <View style={styles.modeContent}>
                      <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>{option.label}</Text>
                      <Text style={styles.modeSub}>{option.sub}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {(notificationMode || 'specific') === 'specific' && (
                <View style={styles.timeSelectorContainer}>
                  <Text style={styles.timeSelectorTitle}>Select reminder times</Text>
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.filter((_, i) => i % 2 === 0).map((time) => {
                      const isSelected = (notificationTimes || ['08:00']).includes(time);
                      return (
                        <TouchableOpacity
                          key={time}
                          onPress={() => handleToggleTime(time)}
                          style={[styles.timeChip, isSelected && styles.timeChipActive]}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>
                            {time}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>STREAK</Text>
          <SettingsRow
            icon={<Shield size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="Streak shield"
            value={streakShieldAvailable ? 'Available' : 'Used'}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
          <SettingsRow
            icon={<CreditCard size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="Premium"
            value="Active"
          />
          <SettingsRow
            icon={<RotateCcw size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="Restore purchases"
            onPress={() => Alert.alert('Restore', 'No previous purchases found.')}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <SettingsRow
            icon={<BookOpen size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="Scientific evidence"
            onPress={() => Alert.alert('Info', 'Coming soon.')}
          />
          <SettingsRow
            icon={<HelpCircle size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="FAQ"
            onPress={() => Alert.alert('FAQ', 'Coming soon.')}
          />
          <SettingsRow
            icon={<Mail size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="Contact us"
            onPress={() => Alert.alert('Contact', 'Support coming soon.')}
          />
          <SettingsRow
            icon={<Star size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="Rate the app"
            onPress={() => Alert.alert('Thank you!', 'Rating coming soon.')}
          />
          <SettingsRow
            icon={<RefreshCw size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="Restart onboarding"
            onPress={() => {
              Alert.alert(
                'Restart Onboarding',
                'This will take you through the setup flow again. Your progress data will be kept.',
                [
                  { text: 'Cancel', style: 'cancel' as const },
                  {
                    text: 'Restart',
                    onPress: () => {
                      updateState({ onboardingComplete: false });
                      router.replace('/' as never);
                    },
                  },
                ]
              );
            }}
          />
        </View>

        <TouchableOpacity onPress={handleResetOnboarding} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset App Data</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Velora v1.0.0</Text>
        <Text style={styles.legalText}>© 2026 Velora · All rights reserved</Text>
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
  profileHeader: {
    alignItems: 'center' as const,
    paddingTop: 24,
    paddingBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.navy,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: Fonts.dmBold,
    fontSize: 20,
    color: Colors.white,
  },
  profileName: {
    fontFamily: Fonts.playfairBold,
    fontSize: 20,
    color: Colors.navy,
  },
  profileSub: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden' as const,
  },
  sectionTitle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 12,
    color: Colors.mediumGray,
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsRowLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  settingsLabel: {
    fontFamily: Fonts.dmRegular,
    fontSize: 15,
    color: Colors.darkGray,
  },
  settingsRowRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  settingsValue: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: Colors.mediumGray,
  },
  notifToggleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center' as const,
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Colors.navy,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end' as const,
  },
  notifDivider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginHorizontal: 16,
  },
  notifModeTitle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 13,
    color: Colors.navy,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  modeRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  modeRowActive: {
    backgroundColor: Colors.blueBg,
  },
  modeRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modeRadioActive: {
    borderColor: Colors.navy,
  },
  modeRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.navy,
  },
  modeContent: {
    flex: 1,
  },
  modeLabel: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 14,
    color: Colors.darkGray,
  },
  modeLabelActive: {
    color: Colors.navy,
  },
  modeSub: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.mediumGray,
    marginTop: 1,
  },
  timeSelectorContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  timeSelectorTitle: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.mediumGray,
    marginBottom: 10,
  },
  timeGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeChipActive: {
    backgroundColor: Colors.blueBg,
    borderColor: Colors.navy,
  },
  timeChipText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: Colors.mediumGray,
  },
  timeChipTextActive: {
    fontFamily: Fonts.dmSemiBold,
    color: Colors.navy,
  },
  resetButton: {
    alignItems: 'center' as const,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  resetText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: Colors.warning,
  },
  versionText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 11,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    marginTop: 24,
  },
  legalText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 11,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    marginTop: 4,
  },
});
