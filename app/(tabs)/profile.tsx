import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Clock, Pill, Target, CreditCard, RotateCcw, BookOpen, HelpCircle, Mail, Star, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS } from '@/constants/content';
import { PRODUCTS } from '@/constants/products';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingsRow({ icon, label, value, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsRow} activeOpacity={onPress ? 0.6 : 1}>
      <View style={styles.settingsRowLeft}>
        {icon}
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <View style={styles.settingsRowRight}>
        {value && <Text style={styles.settingsValue}>{value}</Text>}
        {onPress && <ChevronRight size={18} color={Colors.mediumGray} />}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userName, goal, routineTime, products, currentDay, totalDaysTaken, updateState } = useAppState();

  const router = useRouter();
  const goalData = GOALS.find(g => g.id === goal);
  const productCount = products.length;
  const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';


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
            });
          },
        },
      ]
    );
  }, [updateState]);

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
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <SettingsRow
            icon={<BookOpen size={20} color={Colors.navy} strokeWidth={1.5} />}
            label="Scientific evidence"
            onPress={() => Alert.alert('Info', 'Coming soon.')}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
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
