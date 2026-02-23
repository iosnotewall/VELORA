import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Clock, CheckCircle, Moon as MoonIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { PRODUCTS } from '@/constants/products';
import { GOALS, getDayInsight } from '@/constants/content';

function ConfettiParticle({ delay, color, startX }: { delay: number; color: string; startX: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 1200,
      delay,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [anim, delay]);

  const velocityX = (Math.random() - 0.5) * 300;

  return (
    <Animated.View
      style={{
        position: 'absolute' as const,
        width: 6,
        height: 6,
        borderRadius: Math.random() > 0.5 ? 3 : 1,
        backgroundColor: color,
        left: startX,
        top: 0,
        opacity: anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, velocityX] }) },
          { translateY: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, -120, 40] }) },
          { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${Math.random() * 720}deg`] }) },
        ],
      }}
    />
  );
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { goal, products, currentStreak, currentDay, isCheckedInToday, checkIn, userName } = useAppState();
  const [showConfetti, setShowConfetti] = useState(false);
  const checkAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;
  const streakBounce = useRef(new Animated.Value(1)).current;

  const goalData = GOALS.find(g => g.id === goal);
  const userProducts = PRODUCTS.filter(p => products.includes(p.id));

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if (isCheckedInToday) {
      checkAnim.setValue(1);
    }
  }, [isCheckedInToday, checkAnim]);

  const handleCheckIn = useCallback(() => {
    if (isCheckedInToday) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.spring(buttonScaleAnim, { toValue: 0.96, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(buttonScaleAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 15, stiffness: 200 }),
    ]).start();

    checkIn();
    setShowConfetti(true);

    Animated.spring(checkAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 18,
      stiffness: 200,
    }).start();

    Animated.sequence([
      Animated.spring(streakBounce, { toValue: 1.3, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(streakBounce, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 12, stiffness: 200 }),
    ]).start();

    Animated.spring(insightAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 18,
      stiffness: 150,
      delay: 600,
    }).start();

    setTimeout(() => setShowConfetti(false), 2000);
  }, [isCheckedInToday, checkIn, checkAnim, buttonScaleAnim, streakBounce, insightAnim]);

  const confettiColors = [Colors.navy, Colors.blue, Colors.cream, Colors.gold];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}{userName ? `, ${userName}` : ''}</Text>
            <Text style={styles.dayTitle}>Day {currentDay} of your journey</Text>
          </View>
          <Animated.View style={[styles.streakBadge, { transform: [{ scale: streakBounce }] }]}>
            <Flame size={18} color="#E67E22" fill="#E67E22" />
            <Text style={styles.streakNumber}>{currentStreak}</Text>
          </Animated.View>
        </View>

        <View style={styles.heroCard}>
          {showConfetti && (
            <View style={styles.confettiContainer}>
              {Array.from({ length: 12 }).map((_, i) => (
                <ConfettiParticle
                  key={i}
                  delay={i * 40}
                  color={confettiColors[i % confettiColors.length]}
                  startX={140 + (Math.random() - 0.5) * 40}
                />
              ))}
            </View>
          )}

          <Animated.View style={[
            styles.statusCircle,
            isCheckedInToday && styles.statusCircleDone,
            {
              transform: [{
                scale: checkAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1] }),
              }],
            },
          ]}>
            {isCheckedInToday ? (
              <Animated.View style={{ opacity: checkAnim }}>
                <CheckCircle size={48} color={Colors.white} strokeWidth={1.5} />
              </Animated.View>
            ) : (
              <Clock size={40} color={Colors.mediumGray} strokeWidth={1.5} />
            )}
          </Animated.View>

          <Text style={[styles.statusText, isCheckedInToday && styles.statusTextDone]}>
            {isCheckedInToday ? 'Done for today ✓' : 'Tap when you\'ve taken your supplements'}
          </Text>

          {!isCheckedInToday ? (
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }], width: '100%' }}>
              <TouchableOpacity onPress={handleCheckIn} style={styles.checkInButton} activeOpacity={0.85} testID="check-in-button">
                <Text style={styles.checkInButtonText}>I took my supplements</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.doneSection}>
              <MoonIcon size={20} color={Colors.mediumGray} strokeWidth={1.5} />
              <Text style={styles.doneText}>See you tomorrow</Text>
            </View>
          )}
        </View>

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
            <Text style={styles.insightText}>{getDayInsight(currentDay)}</Text>
          </Animated.View>
        )}

        {userProducts.length > 0 && (
          <View style={styles.supplementsSection}>
            <Text style={styles.sectionLabel}>YOUR SUPPLEMENTS TODAY</Text>
            {userProducts.map((product) => (
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
    paddingBottom: 12,
  },
  greeting: {
    fontFamily: Fonts.dmRegular,
    fontSize: 15,
    color: Colors.mediumGray,
  },
  dayTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 22,
    color: Colors.navy,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.goldBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  streakNumber: {
    fontFamily: Fonts.dmBold,
    fontSize: 18,
    color: '#E67E22',
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 32,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden' as const,
  },
  confettiContainer: {
    position: 'absolute' as const,
    top: 20,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 10,
  },
  statusCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.lightGray,
    borderStyle: 'dashed' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  statusCircleDone: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
    borderStyle: 'solid' as const,
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
    fontSize: 16,
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
  insightCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cream,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
  },
  insightText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 24,
  },
  supplementsSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionLabel: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 12,
    color: Colors.mediumGray,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  supplementRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  supplementDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    marginTop: 2,
  },
  goalCard: {
    backgroundColor: Colors.blueBg,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
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
