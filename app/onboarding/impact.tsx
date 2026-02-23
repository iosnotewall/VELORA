import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingDown, Clock, CalendarX } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

export default function ImpactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName, missedDoses } = useAppState();

  const daysPerWeek = missedDoses ?? 3;
  const missedPerWeek = 7 - daysPerWeek;
  const missedPerYear = missedPerWeek * 52;
  const weeksLost = Math.round(missedPerYear / 7);
  const monthsLost = Math.round(weeksLost / 4.3);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const numberAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;
  const dividerAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const ghostAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const [counterVal, setCounterVal] = useState(0);
  const counterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = counterAnim.addListener(({ value }) => {
      setCounterVal(Math.round(value));
    });

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(headerAnim, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(counterAnim, { toValue: missedPerYear, duration: 1200, useNativeDriver: false }),
        Animated.timing(numberAnim, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.timing(labelAnim, { toValue: 1, duration: 350, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(300),
      Animated.timing(dividerAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.delay(100),
      Animated.timing(card1Anim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(200),
      Animated.timing(card2Anim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(400),
      Animated.timing(ghostAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(200),
      Animated.timing(btnAnim, { toValue: 1, duration: 350, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1500);

    return () => counterAnim.removeListener(listener);
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  });

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/shock' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.content}>
        <Animated.Text style={[styles.nameLine, fadeSlide(headerAnim)]}>
          {userName || 'friend'}, you'll miss about
        </Animated.Text>

        <Animated.View style={[styles.numberBlock, fadeSlide(numberAnim)]}>
          <Text style={styles.bigNumber}>{counterVal}</Text>
          <Animated.Text style={[styles.dosesLabel, fadeSlide(labelAnim)]}>
            doses this year
          </Animated.Text>
        </Animated.View>

        <Animated.View style={[styles.divider, { opacity: dividerAnim }]} />

        <View style={styles.cardsWrap}>
          <Animated.View style={[styles.statCard, fadeSlide(card1Anim)]}>
            <View style={[styles.statIconWrap, { backgroundColor: Colors.warningBg }]}>
              <Clock size={18} color={Colors.warning} strokeWidth={2.2} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                <Text style={styles.statHighlight}>{weeksLost} weeks</Text> of lost progress
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.statCard, fadeSlide(card2Anim)]}>
            <View style={[styles.statIconWrap, { backgroundColor: Colors.blueBg }]}>
              <CalendarX size={18} color={Colors.blue} strokeWidth={2.2} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                <Text style={styles.statHighlight}>{monthsLost} months</Text> your body could've been improving
              </Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.ghostWrap, fadeSlide(ghostAnim)]}>
          <View style={styles.accentLine} />
          <Text style={styles.ghostText}>what if you never missed again?</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="Show me how" onPress={handleContinue} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center' as const,
  },
  nameLine: {
    fontFamily: Fonts.body,
    fontSize: 17,
    color: Colors.mediumGray,
    marginBottom: 8,
  },
  numberBlock: {
    marginBottom: 28,
  },
  bigNumber: {
    fontFamily: Fonts.heading,
    fontSize: 72,
    color: Colors.navy,
    letterSpacing: -2,
    lineHeight: 80,
  },
  dosesLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 22,
    color: Colors.navy,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  cardsWrap: {
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 22,
  },
  statHighlight: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 15,
    color: Colors.navy,
  },
  ghostWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingHorizontal: 4,
  },
  accentLine: {
    width: 3,
    height: 24,
    backgroundColor: Colors.blue,
    borderRadius: 2,
  },
  ghostText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 18,
    color: Colors.blue,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
