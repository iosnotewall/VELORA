import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, ArrowRight, Clock, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import { GOALS, MILESTONES } from '@/constants/content';
import PrimaryButton from '@/components/PrimaryButton';

const useNative = Platform.OS !== 'web';

const WASTE_MESSAGES: Record<string, string> = {
  energy: "You're running on empty — and your supplements aren't reaching your cells.",
  stress: "Your cortisol keeps spiking, and the adaptogens you bought can't help if they're sitting in a drawer.",
  pain: "The inflammation compounds every day you miss. Your joints don't get days off.",
  menopause: "Your hormones are shifting daily — inconsistent supplementation means your body can't find its new balance.",
  metabolism: "Every skipped dose is a missed chance to stabilize your blood sugar and reset your metabolism.",
  digestion: "Your gut microbiome resets when you stop. Consistency is the only language it understands.",
  focus: "Brain fog doesn't wait for you to remember your supplements. Every gap widens the deficit.",
  cycle: "Hormonal balance is built across your entire cycle — not just the days you remember.",
  fertility: "Egg quality takes 90 days to influence. Every missed dose is a day your body can't get back.",
  antiaging: "Free radicals don't take breaks. Every missed dose leaves your cells unprotected.",
};

const COST_STATS: Record<string, string> = {
  energy: "Women who miss 3+ doses/week absorb up to 60% less of their supplements.",
  stress: "Inconsistent magnesium intake can leave cortisol elevated for 48+ hours longer.",
  pain: "PEA needs daily accumulation — skipping resets the anti-inflammatory cascade.",
  menopause: "Phytoestrogens require steady-state levels to reduce hot flash frequency.",
  metabolism: "Irregular supplementation can cause 2x more glucose spikes per day.",
  digestion: "Your microbiome diversity drops within 72 hours of inconsistency.",
  focus: "Nootropics lose 70% of their effect when taken inconsistently.",
  cycle: "Hormonal support supplements need 21+ consecutive days to influence your cycle.",
  fertility: "Egg maturation takes ~90 days — gaps in nutrition can't be made up later.",
  antiaging: "Oxidative damage from just 1 missed day takes 3 days to reverse.",
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

  const missedPerWeek = missedDoses || 3;
  const monthlyWaste = missedPerWeek * 4;
  const yearlyWaste = monthlyWaste * 12;
  const productCount = products?.length || 1;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const realityAnim = useRef(new Animated.Value(0)).current;
  const statAnim = useRef(new Animated.Value(0)).current;
  const dividerAnim = useRef(new Animated.Value(0)).current;
  const futureAnim = useRef(new Animated.Value(0)).current;
  const milestone1Anim = useRef(new Animated.Value(0)).current;
  const milestone2Anim = useRef(new Animated.Value(0)).current;
  const milestone3Anim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const counterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.timing(realityAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.parallel([
        Animated.timing(counterAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(statAnim, { toValue: 1, duration: 600, delay: 400, useNativeDriver: useNative }),
      ]),
      Animated.timing(dividerAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.timing(futureAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.stagger(200, [
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

  const animatedYearlyWaste = counterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, yearlyWaste],
  });

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
            <Text style={styles.greeting}>here's the truth.</Text>
          )}
          <Text style={styles.headline}>your supplements{'\n'}aren't working yet.</Text>
        </Animated.View>

        <Animated.View style={[styles.realityCard, fadeSlide(realityAnim)]}>
          <View style={styles.realityIconRow}>
            <View style={styles.warningIcon}>
              <AlertTriangle size={18} color="#C4573A" strokeWidth={2.2} />
            </View>
            <Text style={styles.realityLabel}>the reality</Text>
          </View>
          <Text style={styles.realityText}>{wasteMessage}</Text>

          <View style={styles.wasteRow}>
            <View style={styles.wasteBlock}>
              <Animated.Text style={[styles.wasteNumber, {
                opacity: counterAnim,
              }]}>
                {missedPerWeek}
              </Animated.Text>
              <Text style={styles.wasteUnit}>missed doses{'\n'}per week</Text>
            </View>
            <View style={styles.wasteDivider} />
            <View style={styles.wasteBlock}>
              <Animated.Text style={[styles.wasteNumber, {
                opacity: counterAnim,
              }]}>
                {monthlyWaste}
              </Animated.Text>
              <Text style={styles.wasteUnit}>missed doses{'\n'}per month</Text>
            </View>
            <View style={styles.wasteDivider} />
            <View style={styles.wasteBlock}>
              <AnimatedCounter value={yearlyWaste} anim={counterAnim} />
              <Text style={styles.wasteUnit}>missed doses{'\n'}per year</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.costCard, fadeSlide(statAnim)]}>
          <Text style={styles.costText}>{costStat}</Text>
        </Animated.View>

        <Animated.View style={[styles.dividerLine, {
          width: dividerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }]} />

        <Animated.View style={fadeSlide(futureAnim)}>
          <View style={styles.futureHeader}>
            <Sparkles size={16} color={Colors.blue} strokeWidth={2} />
            <Text style={styles.futureLabel}>but here's what happens when you don't miss</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.milestoneCard, fadeSlide(milestone1Anim)]}>
          <View style={styles.milestoneTimeline}>
            <View style={[styles.milestoneCircle, { backgroundColor: '#E8EBF5' }]}>
              <Text style={styles.milestoneDay}>7</Text>
            </View>
            <View style={styles.milestoneLine} />
          </View>
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneLabel}>day 7</Text>
            <Text style={styles.milestoneText}>{milestones.d7}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.milestoneCard, fadeSlide(milestone2Anim)]}>
          <View style={styles.milestoneTimeline}>
            <View style={[styles.milestoneCircle, { backgroundColor: '#E6F4ED' }]}>
              <Text style={[styles.milestoneDay, { color: Colors.success }]}>21</Text>
            </View>
            <View style={styles.milestoneLine} />
          </View>
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneLabel}>day 21</Text>
            <Text style={styles.milestoneText}>{milestones.d21}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.milestoneCard, styles.milestoneCardLast, fadeSlide(milestone3Anim)]}>
          <View style={styles.milestoneTimeline}>
            <View style={[styles.milestoneCircle, { backgroundColor: Colors.goldBg }]}>
              <Text style={[styles.milestoneDay, { color: '#B8860B' }]}>30</Text>
            </View>
          </View>
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneLabel}>day 30</Text>
            <Text style={[styles.milestoneText, styles.milestoneTextHighlight]}>{milestones.d30}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.closerCard, fadeSlide(btnAnim)]}>
          <Text style={styles.closerText}>
            You already bought the supplements.{'\n'}
            <Text style={styles.closerBold}>Let's make sure they actually work.</Text>
          </Text>
          <View style={styles.closerArrow}>
            <ArrowRight size={16} color={Colors.blue} strokeWidth={2.5} />
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20), opacity: btnAnim }]}>
        <PrimaryButton title="Show me how" onPress={handleContinue} />
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

  return <Text style={styles.wasteNumber}>{displayValue}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
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
    color: Colors.mediumGray,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  realityCard: {
    backgroundColor: '#FDF6F4',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(196,87,58,0.1)',
  },
  realityIconRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  warningIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(196,87,58,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  realityLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 12,
    color: '#C4573A',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  realityText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 23,
    marginBottom: 20,
  },
  wasteRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  wasteBlock: {
    flex: 1,
    alignItems: 'center' as const,
  },
  wasteNumber: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: '#C4573A',
    letterSpacing: -1,
  },
  wasteUnit: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 15,
    marginTop: 2,
  },
  wasteDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(196,87,58,0.12)',
  },
  costCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(138,122,104,0.08)',
  },
  costText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.darkGray,
    lineHeight: 20,
    fontStyle: 'italic' as const,
  },
  dividerLine: {
    height: 2,
    backgroundColor: Colors.blue,
    borderRadius: 1,
    marginBottom: 24,
    opacity: 0.2,
  },
  futureHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 20,
  },
  futureLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: Colors.blue,
    flex: 1,
    lineHeight: 20,
  },
  milestoneCard: {
    flexDirection: 'row' as const,
    marginBottom: 0,
    minHeight: 80,
  },
  milestoneCardLast: {
    marginBottom: 20,
  },
  milestoneTimeline: {
    width: 44,
    alignItems: 'center' as const,
  },
  milestoneCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  milestoneDay: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.blue,
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 4,
  },
  milestoneContent: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 20,
  },
  milestoneLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 12,
    color: Colors.mediumGray,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  milestoneText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 21,
  },
  milestoneTextHighlight: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.navy,
  },
  closerCard: {
    backgroundColor: Colors.blueBg,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 8,
  },
  closerText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.navy,
    lineHeight: 21,
  },
  closerBold: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
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
    backgroundColor: '#FAF7F2',
    borderTopWidth: 1,
    borderTopColor: 'rgba(138,122,104,0.06)',
  },
});
