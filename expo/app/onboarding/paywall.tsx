import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Shield } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';

const BENEFITS = [
  'Smart daily reminders that actually motivate you',
  'Track your 30-day biological timeline',
  'Science-backed insights for your supplements',
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName, updateState } = useAppState();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const benefitsAnim = useRef(new Animated.Value(0)).current;
  const plansAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  const trialEndStr = trialEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(benefitsAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(plansAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(ctaAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const handlePurchase = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateState({ onboardingComplete: true });
    router.replace('/(tabs)/today' as any);
  }, [updateState, router]);

  const handleRestore = useCallback(() => {
    Alert.alert('Restore', 'No previous purchases found.');
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <Animated.View style={[styles.header, fadeSlide(headerAnim)]}>
        <Text style={styles.commitLine}>
          You've committed{userName ? `, ${userName}` : ''}.
        </Text>
        <Text style={styles.headline}>Now get the tools{'\n'}to follow through.</Text>
      </Animated.View>

      <Animated.View style={[styles.benefits, fadeSlide(benefitsAnim)]}>
        {BENEFITS.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <View style={styles.checkCircle}>
              <Check size={13} color={Colors.white} strokeWidth={2.5} />
            </View>
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.planRow, fadeSlide(plansAnim)]}>
        <TouchableOpacity
          onPress={() => { setSelectedPlan('monthly'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
          activeOpacity={0.8}
        >
          <Text style={styles.planLabel}>Monthly</Text>
          <Text style={styles.planPrice}>€4.99/mo</Text>
          <Text style={styles.planSub}>Cancel anytime</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setSelectedPlan('annual'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={[styles.planCard, selectedPlan === 'annual' && styles.planCardSelected]}
          activeOpacity={0.8}
        >
          {selectedPlan === 'annual' && (
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>BEST VALUE</Text>
            </View>
          )}
          <Text style={styles.planLabel}>Annual</Text>
          <Text style={styles.planPrice}>€29.99/yr</Text>
          <Text style={styles.planSave}>= €2.50/mo · Save 50%</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={fadeSlide(ctaAnim)}>
        <TouchableOpacity onPress={handlePurchase} style={styles.ctaButton} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Start my free trial</Text>
        </TouchableOpacity>

        <Text style={styles.trialText}>
          7-day free trial · No charge until {trialEndStr}
        </Text>

        <View style={styles.trustRow}>
          <Shield size={14} color="rgba(255,255,255,0.5)" strokeWidth={1.5} />
          <Text style={styles.trustText}>Cancel before trial ends, pay nothing.</Text>
        </View>

        <View style={styles.legalRow}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.legalText}>Restore Purchase</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
          <Text style={styles.legalText}>Terms</Text>
          <Text style={styles.legalDot}>·</Text>
          <Text style={styles.legalText}>Privacy</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2E',
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 28,
  },
  commitLine: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.blue,
    marginBottom: 8,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.white,
    lineHeight: 38,
  },
  benefits: {
    gap: 14,
    marginBottom: 28,
  },
  benefitRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.deepBlue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 1,
  },
  benefitText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.white,
    flex: 1,
    lineHeight: 22,
  },
  planRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center' as const,
    gap: 3,
  },
  planCardSelected: {
    borderColor: Colors.white,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bestBadge: {
    position: 'absolute' as const,
    top: -10,
    right: -4,
    backgroundColor: Colors.blue,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestBadgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 9,
    color: Colors.navy,
    letterSpacing: 0.5,
  },
  planLabel: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  planPrice: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.white,
  },
  planSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  planSave: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: '#4ADE80',
  },
  ctaButton: {
    backgroundColor: Colors.white,
    height: 56,
    borderRadius: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 10,
  },
  ctaText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  trialText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const,
    marginBottom: 10,
  },
  trustRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    marginBottom: 14,
  },
  trustText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  legalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  legalText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  legalDot: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
});
