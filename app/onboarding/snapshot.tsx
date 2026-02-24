import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Leaf, Pill, Hourglass, Flame } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import { GOALS, COMMITMENT_OPTIONS, FREQUENCY_OPTIONS } from '@/constants/content';
import PrimaryButton from '@/components/PrimaryButton';

export default function SnapshotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, frequency, commitmentLevel, products, missedDoses } = useAppState();

  const goalData = GOALS.find(g => g.id === goal);
  const commitOption = COMMITMENT_OPTIONS.find(c => c.id === commitmentLevel);
  const freqOption = FREQUENCY_OPTIONS.find(f => f.value === frequency);

  const consistencyDays = frequency || 3;
  const commitPercent = commitOption ? (commitOption.value / 4) * 100 : 50;
  const productCount = products?.length || 1;
  const absorptionRate = Math.max(40, 100 - (missedDoses || 2) * 15);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const bar1Width = useRef(new Animated.Value(0)).current;
  const bar2Width = useRef(new Animated.Value(0)).current;
  const bar3Width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(subtitleAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.stagger(150, [
        Animated.spring(card1Anim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 18, stiffness: 130 }),
        Animated.spring(card2Anim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 18, stiffness: 130 }),
        Animated.spring(card3Anim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 18, stiffness: 130 }),
      ]),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    Animated.stagger(300, [
      Animated.timing(bar1Width, { toValue: consistencyDays / 7, duration: 900, delay: 1200, useNativeDriver: false }),
      Animated.timing(bar2Width, { toValue: absorptionRate / 100, duration: 900, useNativeDriver: false }),
      Animated.timing(bar3Width, { toValue: commitPercent / 100, duration: 900, useNativeDriver: false }),
    ]).start();
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  const consistencyLabel = consistencyDays <= 2 ? 'low' : consistencyDays <= 5 ? 'moderate' : 'high';
  const commitLabel = commitPercent <= 25 ? 'low' : commitPercent <= 75 ? 'moderate' : 'high';

  const handleContinue = useCallback(() => {
    router.push('/onboarding/notification' as any);
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.content}>
        <Animated.View style={fadeSlide(headerAnim)}>
          <View style={styles.headerIconWrap}>
            <Leaf size={24} color={Colors.blue} strokeWidth={2} />
          </View>
          <Text style={styles.headline}>your personalized{'\n'}supplement snapshot</Text>
        </Animated.View>

        <Animated.Text style={[styles.subtitle, fadeSlide(subtitleAnim)]}>
          based on your answers, here's where you're at:
        </Animated.Text>

        <Animated.View style={[styles.card, fadeSlide(card1Anim)]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <Pill size={18} color={Colors.blue} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>current consistency</Text>
          </View>
          <View style={styles.barContainer}>
            <View style={styles.barLabels}>
              <Text style={[styles.barLabel, consistencyDays <= 3 && styles.barLabelActive]}>low</Text>
              <Text style={[styles.barLabel, consistencyDays > 3 && styles.barLabelActive]}>high</Text>
            </View>
            <View style={styles.barTrack}>
              <Animated.View style={[styles.barFill, styles.barFillWarm, { width: bar1Width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
          </View>
          <Text style={styles.cardStat}>{consistencyDays}/7 days</Text>
        </Animated.View>

        <Animated.View style={[styles.card, fadeSlide(card2Anim)]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <Hourglass size={18} color={Colors.gold} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>estimated absorption rate</Text>
          </View>
          <Text style={styles.cardDescription}>based on {productCount} supplement{productCount > 1 ? 's' : ''} &amp; your routine</Text>
          <Text style={styles.cardBigStat}>{absorptionRate}%</Text>
        </Animated.View>

        <Animated.View style={[styles.card, fadeSlide(card3Anim)]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <Flame size={18} color={Colors.warning} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>commitment level</Text>
          </View>
          <View style={styles.barContainer}>
            <View style={styles.barLabels}>
              <Text style={[styles.barLabel, commitPercent <= 50 && styles.barLabelActive]}>low</Text>
              <Text style={[styles.barLabel, commitPercent > 50 && styles.barLabelActive]}>high</Text>
            </View>
            <View style={styles.barTrack}>
              <Animated.View style={[styles.barFill, styles.barFillBlue, { width: bar3Width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
          </View>
          <Text style={styles.cardStat}>{Math.round(commitPercent)}%</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim }]}>
        <PrimaryButton title="Continue" onPress={handleContinue} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.softBlue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 8,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.mediumGray,
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 10,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0F2F8',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.navy,
  },
  cardDescription: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 6,
  },
  cardBigStat: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: Colors.navy,
  },
  cardStat: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.darkGray,
    marginTop: 6,
  },
  barContainer: {
    gap: 4,
  },
  barLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  barLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.mediumGray,
  },
  barLabelActive: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.darkGray,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#EAECF0',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barFillWarm: {
    backgroundColor: '#E8A55A',
  },
  barFillBlue: {
    backgroundColor: Colors.blue,
  },
  footer: {
    paddingTop: 12,
  },
});
