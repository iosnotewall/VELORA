import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

const OPTIONS = [
  { label: '1–2 days', value: 2, sub: 'Just getting started', emoji: '😟' },
  { label: '3–4 days', value: 4, sub: 'Building a habit', emoji: '😐' },
  { label: '5–6 days', value: 6, sub: 'Almost daily', emoji: '😊' },
  { label: 'Every single day', value: 7, sub: 'Fully committed', emoji: '🌟' },
];

export default function MissedDosesScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<number | null>(null);

  const optionAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef(OPTIONS.map(() => new Animated.Value(1))).current;
  const selectionAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(100, optionAnims.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: Platform.OS !== 'web',
      })
    )).start();
  }, []);

  const handleSelect = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (selected !== null && selected !== index) {
      Animated.timing(selectionAnims[selected], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    setSelected(index);

    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 60,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    Animated.timing(selectionAnims[index], {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [selected, scaleAnims, selectionAnims]);

  const handleContinue = useCallback(() => {
    if (selected === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateState({ missedDoses: OPTIONS[selected].value });
    router.push('/onboarding/impact' as any);
  }, [selected, updateState, router]);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  return (
    <OnboardingScreen step={4} totalSteps={9} ctaText="Continue" ctaEnabled={selected !== null} onCta={handleContinue}>
      <Text style={styles.headline}>How many times a week do you actually take your supplements?</Text>

      <View style={styles.optionsWrap}>
        {OPTIONS.map((option, index) => {
          const isSelected = selected === index;

          const bgColor = selectionAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [Colors.white, Colors.softBlue],
          });

          const borderColor = selectionAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [Colors.border, Colors.navy],
          });

          const borderWidth = selectionAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1.5, 2],
          });

          return (
            <Animated.View
              key={index}
              style={[
                fadeSlide(optionAnims[index]),
                { transform: [{ scale: scaleAnims[index] }, ...(fadeSlide(optionAnims[index]).transform || [])] },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleSelect(index)}
                activeOpacity={0.7}
                testID={`missed-doses-${index}`}
              >
                <Animated.View
                  style={[
                    styles.optionCard,
                    { backgroundColor: bgColor, borderColor: borderColor, borderWidth: borderWidth },
                  ]}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.optionSub, isSelected && styles.optionSubActive]}>
                      {option.sub}
                    </Text>
                  </View>
                </Animated.View>
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
  optionsWrap: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  optionLabelActive: {
    color: Colors.navy,
  },
  optionSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  optionSubActive: {
    color: Colors.darkGray,
  },
});
