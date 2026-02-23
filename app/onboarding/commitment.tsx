import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { COMMITMENT_OPTIONS } from '@/constants/content';

export default function CommitmentScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string>('');
  const scaleAnims = useRef(COMMITMENT_OPTIONS.map(() => new Animated.Value(1))).current;
  const introAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(introAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }).start();
  }, []);

  const handleSelect = useCallback((id: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
    Animated.sequence([
      Animated.spring(scaleAnims[index], { toValue: 0.95, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 14, stiffness: 200 }),
    ]).start();
  }, [scaleAnims]);

  const handleContinue = useCallback(() => {
    updateState({ commitmentLevel: selected });
    router.push('/onboarding/signature' as any);
  }, [selected, updateState, router]);

  return (
    <OnboardingScreen step={9} totalSteps={9} ctaText="Continue" ctaEnabled={!!selected} onCta={handleContinue}>
      <View style={styles.center}>
        <Animated.View style={{
          opacity: introAnim,
          transform: [{ translateY: introAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }}>
          <Text style={styles.headline}>
            Your plan only works{'\n'}with consistency.
          </Text>
          <Text style={styles.subline}>
            How committed are you to the next 30 days?
          </Text>
        </Animated.View>

        <View style={styles.options}>
          {COMMITMENT_OPTIONS.map((option, index) => {
            const isSelected = selected === option.id;
            return (
              <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnims[index] }] }}>
                <TouchableOpacity
                  onPress={() => handleSelect(option.id, index)}
                  style={[styles.optionCard, isSelected && styles.optionSelected]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{option.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    lineHeight: 34,
    marginBottom: 8,
  },
  subline: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.mediumGray,
    lineHeight: 24,
    marginBottom: 32,
  },
  options: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  optionSelected: {
    borderColor: Colors.navy,
    borderWidth: 2,
    backgroundColor: Colors.softBlue,
  },
  optionEmoji: {
    fontSize: 26,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
    flex: 1,
  },
  optionLabelSelected: {
    color: Colors.navy,
  },
});
