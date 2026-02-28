import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pill, Hourglass, Flame, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import { GOALS, COMMITMENT_OPTIONS, FREQUENCY_OPTIONS } from '@/constants/content';
import PrimaryButton from '@/components/PrimaryButton';

const useNative = Platform.OS !== 'web';

export default function SnapshotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, frequency, commitmentLevel, products, missedDoses } = useAppState();

  const goalData = GOALS.find(g => g.id === goal);
  const commitOption = COMMITMENT_OPTIONS.find(c => c.id === commitmentLevel);
  const goalColor = Colors.category[goal] || Colors.blue;

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
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.timing(subtitleAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.stagger(150, [
        Animated.spring(card1Anim, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 130 }),
        Animated.spring(card2Anim, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 130 }),
        Animated.spring(card3Anim, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 130 }),
      ]),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
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

  const handleContinue = useCallback(() => {
    router.push('/onboarding/notification' as any);
  }, [router]);

  const consistencyColor = consistencyDays <= 2 ? Colors.warning : consistencyDays <= 5 ? Colors.gold : Colors.success;
  const absorptionColor = absorptionRate <= 50 ? Colors.warning : absorptionRate <= 75 ? Colors.gold : Colors.success;
  const commitColor = commitPercent <= 25 ? Colors.warning : commitPercent <= 75 ? Colors.gold : goalColor;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.content}>
        <Animated.View style={fadeSlide(headerAnim)}>
          <View style={[styles.headerBadge, { backgroundColor: goalColor + '12' }]}>
            <TrendingUp size={14} color={goalColor} strokeWidth={2.5} />
            <Text style={[styles.headerBadgeText, { color: goalColor }]}>
              {goalData?.label || 'Your goal'}
            </Text>
          </View>
          <Text style={styles.headline}>your supplement{'\n'}snapshot</Text>
        </Animated.View>

        <Animated.Text style={[styles.subtitle, fadeSlide(subtitleAnim)]}>
          based on your answers, here's where you're starting
        </Animated.Text>

        <Animated.View style={[styles.card, fadeSlide(card1Anim)]}>
          <View style={styles.cardTop}>
            <View style={[styles.cardIconWrap, { backgroundColor: consistencyColor + '12' }]}>
              <Pill size={18} color={consistencyColor} strokeWidth={2} />
            </View>
            <View style={styles.cardTitleArea}>
              <Text style={styles.cardTitle}>current consistency</Text>
              <Text style={[styles.cardStat, { color: consistencyColor }]}>{consistencyDays}/7 days</Text>
            </View>
          </View>
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, {
              backgroundColor: consistencyColor,
              width: bar1Width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }]} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>rarely</Text>
            <Text style={styles.barLabel}>daily</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, fadeSlide(card2Anim)]}>
          <View style={styles.cardTop}>
            <View style={[styles.cardIconWrap, { backgroundColor: absorptionColor + '12' }]}>
              <Hourglass size={18} color={absorptionColor} strokeWidth={2} />
            </View>
            <View style={styles.cardTitleArea}>
              <Text style={styles.cardTitle}>estimated absorption</Text>
              <Text style={styles.cardDescription}>
                based on {productCount} supplement{productCount > 1 ? 's' : ''} & routine
              </Text>
            </View>
          </View>
          <View style={styles.bigStatRow}>
            <Text style={[styles.bigStat, { color: absorptionColor }]}>{absorptionRate}</Text>
            <Text style={[styles.bigStatUnit, { color: absorptionColor }]}>%</Text>
          </View>
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, {
              backgroundColor: absorptionColor,
              width: bar2Width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }]} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, fadeSlide(card3Anim)]}>
          <View style={styles.cardTop}>
            <View style={[styles.cardIconWrap, { backgroundColor: commitColor + '12' }]}>
              <Flame size={18} color={commitColor} strokeWidth={2} />
            </View>
            <View style={styles.cardTitleArea}>
              <Text style={styles.cardTitle}>commitment level</Text>
              <Text style={[styles.cardStat, { color: commitColor }]}>{Math.round(commitPercent)}%</Text>
            </View>
          </View>
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, {
              backgroundColor: commitColor,
              width: bar3Width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }]} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>low</Text>
            <Text style={styles.barLabel}>extremely</Text>
          </View>
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
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  headerBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  headerBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    lineHeight: 36,
    marginBottom: 8,
    letterSpacing: -0.3,
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
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#8A7A68',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(138,122,104,0.06)',
  },
  cardTop: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 14,
  },
  cardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cardTitleArea: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.navy,
    letterSpacing: -0.1,
  },
  cardDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  cardStat: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 13,
    marginTop: 2,
  },
  bigStatRow: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    marginBottom: 10,
    paddingLeft: 50,
  },
  bigStat: {
    fontFamily: Fonts.heading,
    fontSize: 40,
    letterSpacing: -1,
  },
  bigStatUnit: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    marginLeft: 2,
  },
  barTrack: {
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 6,
  },
  barLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.mediumGray,
  },
  footer: {
    paddingTop: 12,
  },
});
