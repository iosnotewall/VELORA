import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, ArrowRight, Sparkles, TrendingDown, Clock, Pill } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import { GOALS, MILESTONES } from '@/constants/content';

const useNative = Platform.OS !== 'web';

const BG_COLOR = '#0B1A2E';
const CARD_BG = 'rgba(255,255,255,0.06)';
const CARD_BORDER = 'rgba(255,255,255,0.08)';
const ACCENT_BLUE = '#4A90D9';
const ACCENT_RED = '#E87C6F';

const WASTE_MESSAGES: Record<string, string> = {
  energy: "Your supplements can't reach your cells if you skip them.",
  stress: "Adaptogens need daily consistency to regulate your cortisol.",
  pain: "Inflammation compounds every day you miss. Your joints don't rest.",
  menopause: "Your hormones shift daily — gaps in supplementation stall your balance.",
  metabolism: "Every skipped dose is a missed window for metabolic stability.",
  digestion: "Your gut microbiome resets when you stop. Consistency is everything.",
  focus: "Brain fog deepens with every gap. Your neurons need daily fuel.",
  cycle: "Hormonal balance is built across your entire cycle — not just some days.",
  fertility: "Egg quality takes 90 days. Every missed dose is time your body can't recover.",
  antiaging: "Free radicals don't take breaks. Neither should your protection.",
};

const COST_STATS: Record<string, string> = {
  energy: "Women who miss 3+ doses/week absorb up to 60% less of their supplements.",
  stress: "Inconsistent magnesium intake leaves cortisol elevated 48+ hours longer.",
  pain: "PEA needs daily accumulation — skipping resets your anti-inflammatory progress.",
  menopause: "Phytoestrogens require steady-state levels to reduce hot flash frequency.",
  metabolism: "Irregular supplementation causes 2x more glucose spikes per day.",
  digestion: "Microbiome diversity drops within 72 hours of inconsistency.",
  focus: "Nootropics lose 70% of their effect when taken inconsistently.",
  cycle: "Hormonal support needs 21+ consecutive days to influence your cycle.",
  fertility: "Egg maturation takes ~90 days — gaps can't be made up later.",
  antiaging: "Oxidative damage from 1 missed day takes 3 days to reverse.",
};

export default function SnapshotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, userName, missedDoses, frequency, products } = useAppState();

  const goalData = GOALS.find(g => g.id === goal);
  const milestones = MILESTONES[goal] || MILESTONES.energy;
  const wasteMessage = WASTE_MESSAGES[goal] || WASTE_MESSAGES.energy;
  const costStat = COST_STATS[goal] || COST_STATS.energy;
  const firstName = userName?.split(' ')[0] || '';
  const goalColor = Colors.category[goal] || Colors.blue;

  const missedPerWeek = missedDoses || 3;
  const monthlyWaste = missedPerWeek * 4;
  const yearlyWaste = monthlyWaste * 12;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const timelineAnim = useRef(new Animated.Value(0)).current;
  const milestone1Anim = useRef(new Animated.Value(0)).current;
  const milestone2Anim = useRef(new Animated.Value(0)).current;
  const milestone3Anim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const counterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(card1Anim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
        Animated.timing(counterAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
      ]),
      Animated.timing(card2Anim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(card3Anim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(timelineAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.stagger(180, [
        Animated.spring(milestone1Anim, { toValue: 1, useNativeDriver: useNative, damping: 20, stiffness: 120 }),
        Animated.spring(milestone2Anim, { toValue: 1, useNativeDriver: useNative, damping: 20, stiffness: 120 }),
        Animated.spring(milestone3Anim, { toValue: 1, useNativeDriver: useNative, damping: 20, stiffness: 120 }),
      ]),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();
  }, []);

  const fadeSlide = (anim: Animated.Value, distance = 24) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  });

  const handleContinue = useCallback(() => {
    router.push('/onboarding/reviews' as any);
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={fadeSlide(headerAnim)}>
          {firstName ? (
            <Text style={styles.greeting}>{firstName}, here's the truth.</Text>
          ) : (
            <Text style={styles.greeting}>Here's the truth.</Text>
          )}
          <Text style={styles.headline}>Your supplements{'\n'}aren't working yet.</Text>
        </Animated.View>

        <Animated.View style={[styles.statsCard, fadeSlide(card1Anim)]}>
          <View style={styles.statsCardHeader}>
            <View style={styles.statsIconWrap}>
              <TrendingDown size={18} color={ACCENT_RED} strokeWidth={2.2} />
            </View>
            <Text style={styles.statsLabel}>MISSED DOSES</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <AnimatedCounter value={missedPerWeek} anim={counterAnim} />
              <Text style={styles.statUnit}>per week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <AnimatedCounter value={monthlyWaste} anim={counterAnim} />
              <Text style={styles.statUnit}>per month</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <AnimatedCounter value={yearlyWaste} anim={counterAnim} />
              <Text style={styles.statUnit}>per year</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.insightCard, fadeSlide(card2Anim)]}>
          <View style={styles.insightIconWrap}>
            <AlertTriangle size={16} color={ACCENT_RED} strokeWidth={2.2} />
          </View>
          <Text style={styles.insightText}>{wasteMessage}</Text>
        </Animated.View>

        <Animated.View style={[styles.scienceCard, fadeSlide(card3Anim)]}>
          <View style={styles.scienceIconWrap}>
            <Pill size={14} color="rgba(255,255,255,0.5)" strokeWidth={2} />
          </View>
          <Text style={styles.scienceText}>{costStat}</Text>
        </Animated.View>

        <Animated.View style={[styles.timelineSection, fadeSlide(timelineAnim)]}>
          <View style={styles.timelineHeader}>
            <Sparkles size={16} color={ACCENT_BLUE} strokeWidth={2} />
            <Text style={styles.timelineLabel}>What happens when you don't miss</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.milestoneCard, fadeSlide(milestone1Anim)]}>
          <View style={styles.milestoneLeft}>
            <View style={[styles.milestoneCircle, { backgroundColor: 'rgba(74,144,217,0.15)' }]}>
              <Text style={[styles.milestoneDay, { color: ACCENT_BLUE }]}>7</Text>
            </View>
            <View style={styles.milestoneLine} />
          </View>
          <View style={styles.milestoneRight}>
            <Text style={styles.milestoneDayLabel}>DAY 7</Text>
            <Text style={styles.milestoneText}>{milestones.d7}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.milestoneCard, fadeSlide(milestone2Anim)]}>
          <View style={styles.milestoneLeft}>
            <View style={[styles.milestoneCircle, { backgroundColor: 'rgba(46,125,82,0.15)' }]}>
              <Text style={[styles.milestoneDay, { color: Colors.success }]}>21</Text>
            </View>
            <View style={styles.milestoneLine} />
          </View>
          <View style={styles.milestoneRight}>
            <Text style={styles.milestoneDayLabel}>DAY 21</Text>
            <Text style={styles.milestoneText}>{milestones.d21}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.milestoneCard, { marginBottom: 24 }, fadeSlide(milestone3Anim)]}>
          <View style={styles.milestoneLeft}>
            <View style={[styles.milestoneCircle, { backgroundColor: 'rgba(212,168,83,0.15)' }]}>
              <Text style={[styles.milestoneDay, { color: Colors.gold }]}>30</Text>
            </View>
          </View>
          <View style={styles.milestoneRight}>
            <Text style={styles.milestoneDayLabel}>DAY 30</Text>
            <Text style={[styles.milestoneText, { color: '#FFFFFF', fontFamily: Fonts.bodyMedium }]}>{milestones.d30}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.closerCard, fadeSlide(btnAnim)]}>
          <Text style={styles.closerText}>
            Consistency is the only missing piece.{'\n'}
            <Text style={styles.closerBold}>We make it effortless.</Text>
          </Text>
          <View style={styles.closerArrow}>
            <ArrowRight size={16} color={ACCENT_BLUE} strokeWidth={2.5} />
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20), opacity: btnAnim }]}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Show me how</Text>
          <ArrowRight size={18} color={BG_COLOR} strokeWidth={2.5} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function AnimatedCounter({ value, anim }: { value: number; anim: Animated.Value }) {
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    const listenerId = anim.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v * value));
    });
    return () => anim.removeListener(listenerId);
  }, [anim, value]);

  return <Text style={styles.statNumber}>{displayValue}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 16,
  },
  greeting: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 28,
  },
  statsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  statsCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 20,
  },
  statsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(232,124,111,0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statsLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 12,
    color: ACCENT_RED,
    letterSpacing: 1.2,
  },
  statsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statNumber: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: ACCENT_RED,
    letterSpacing: -1,
  },
  statUnit: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center' as const,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  insightCard: {
    backgroundColor: 'rgba(232,124,111,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,124,111,0.12)',
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  insightIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(232,124,111,0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 21,
  },
  scienceCard: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 10,
  },
  scienceIconWrap: {
    marginTop: 2,
  },
  scienceText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 20,
    fontStyle: 'italic' as const,
  },
  timelineSection: {
    marginBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  timelineLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 15,
    color: ACCENT_BLUE,
    flex: 1,
    lineHeight: 21,
  },
  milestoneCard: {
    flexDirection: 'row' as const,
    minHeight: 72,
  },
  milestoneLeft: {
    width: 44,
    alignItems: 'center' as const,
  },
  milestoneCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  milestoneDay: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    letterSpacing: -0.5,
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },
  milestoneRight: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 16,
  },
  milestoneDayLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  milestoneText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 21,
  },
  closerCard: {
    backgroundColor: 'rgba(74,144,217,0.08)',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(74,144,217,0.12)',
  },
  closerText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 21,
  },
  closerBold: {
    fontFamily: Fonts.headingSemiBold,
    color: '#FFFFFF',
  },
  closerArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74,144,217,0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 12,
    backgroundColor: BG_COLOR,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  ctaButton: {
    height: 56,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: BG_COLOR,
    letterSpacing: -0.2,
  },
});
