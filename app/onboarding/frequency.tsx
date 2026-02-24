import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { XCircle, CircleDot, TrendingUp, Star } from 'lucide-react-native';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { FREQUENCY_OPTIONS } from '@/constants/content';

const FREQ_ICON_MAP: Record<string, React.ComponentType<any>> = {
  XCircle,
  CircleDot,
  TrendingUp,
  Star,
};

export default function FrequencyScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string>('');
  const scaleAnims = useRef(FREQUENCY_OPTIONS.map(() => new Animated.Value(1))).current;

  const handleSelect = useCallback((id: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
    Animated.sequence([
      Animated.spring(scaleAnims[index], { toValue: 0.96, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 15, stiffness: 200 }),
    ]).start();
  }, [scaleAnims]);

  const handleContinue = useCallback(() => {
    const option = FREQUENCY_OPTIONS.find(o => o.id === selected);
    updateState({ frequency: option?.value || 0 });
    router.push('/onboarding/friction' as any);
  }, [selected, updateState, router]);

  return (
    <OnboardingScreen step={3} totalSteps={9} ctaText="Continue" ctaEnabled={!!selected} onCta={handleContinue}>
      <Text style={styles.headline}>How many days a week do you take your supplements?</Text>

      <View style={styles.options}>
        {FREQUENCY_OPTIONS.map((option, index) => {
          const isSelected = selected === option.id;
          return (
            <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnims[index] }] }}>
              <TouchableOpacity
                onPress={() => handleSelect(option.id, index)}
                style={[styles.optionCard, isSelected && styles.optionSelected]}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                  {FREQ_ICON_MAP[option.icon] && React.createElement(FREQ_ICON_MAP[option.icon], { size: 20, color: isSelected ? Colors.blue : Colors.mediumGray, strokeWidth: 2 })}
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{option.label}</Text>
                  <Text style={[styles.optionSub, isSelected && styles.optionSubSelected]}>{option.sub}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    lineHeight: 34,
    marginTop: 8,
    marginBottom: 24,
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EEED',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  iconWrapSelected: {
    backgroundColor: '#E0E8F5',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  optionLabelSelected: {
    color: Colors.navy,
  },
  optionSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  optionSubSelected: {
    color: Colors.darkGray,
  },
});
