import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

const OPTIONS = [
  {
    id: 'rarely',
    label: 'Rarely',
    desc: 'Once a week, maybe less',
    value: 1,
    accent: Colors.warning,
  },
  {
    id: 'hit-or-miss',
    label: 'Hit or miss',
    desc: 'Some weeks yes, some no',
    value: 3,
    accent: '#D4A853',
  },
  {
    id: 'almost-always',
    label: 'Almost always',
    desc: 'I miss the occasional day',
    value: 6,
    accent: Colors.blue,
  },
  {
    id: 'never-miss',
    label: 'Never miss',
    desc: "It's locked into my routine",
    value: 7,
    accent: Colors.success,
  },
];

export default function MissedDosesScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string | null>(null);

  const optionAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef(OPTIONS.map(() => new Animated.Value(1))).current;
  const selectionAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;
  const checkAnims = useRef(OPTIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(80, optionAnims.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: Platform.OS !== 'web',
      })
    )).start();
  }, []);

  const handleSelect = useCallback((id: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (selected !== null) {
      const prevIndex = OPTIONS.findIndex(o => o.id === selected);
      if (prevIndex !== -1 && prevIndex !== index) {
        Animated.parallel([
          Animated.timing(selectionAnims[prevIndex], {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(checkAnims[prevIndex], {
            toValue: 0,
            duration: 150,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      }
    }

    setSelected(id);

    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.96,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        damping: 14,
        stiffness: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(selectionAnims[index], {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(checkAnims[index], {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [selected, scaleAnims, selectionAnims, checkAnims]);

  const handleContinue = useCallback(() => {
    if (selected === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const option = OPTIONS.find(o => o.id === selected);
    if (!option) return;

    updateState({ missedDoses: option.value });

    if (option.id === 'never-miss') {
      router.push('/onboarding/shock' as any);
    } else {
      router.push('/onboarding/impact' as any);
    }
  }, [selected, updateState, router]);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  });

  return (
    <OnboardingScreen step={4} totalSteps={9} ctaText="Continue" ctaEnabled={selected !== null} onCta={handleContinue}>
      <Text style={styles.eyebrow}>be honest with yourself</Text>
      <Text style={styles.headline}>When life gets busy,{'\n'}how often do your supplements actually happen?</Text>

      <View style={styles.optionsWrap}>
        {OPTIONS.map((option, index) => {
          const isSelected = selected === option.id;

          const bgColor = selectionAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255,255,255,1)', Colors.softBlue],
          });

          const borderColor = selectionAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [Colors.border, Colors.navy],
          });

          const accentWidth = selectionAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 3],
          });

          return (
            <Animated.View
              key={option.id}
              style={[
                fadeSlide(optionAnims[index]),
                { transform: [{ scale: scaleAnims[index] }, ...(fadeSlide(optionAnims[index]).transform || [])] },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleSelect(option.id, index)}
                activeOpacity={0.7}
                testID={`missed-doses-${option.id}`}
              >
                <Animated.View
                  style={[
                    styles.optionCard,
                    { backgroundColor: bgColor, borderColor: borderColor },
                  ]}
                >
                  <Animated.View style={[styles.accentBar, { width: accentWidth, backgroundColor: option.accent }]} />
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.optionDesc, isSelected && styles.optionDescActive]}>
                      {option.desc}
                    </Text>
                  </View>
                  <Animated.View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterActive,
                      {
                        transform: [{
                          scale: checkAnims[index].interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.15, 1],
                          }),
                        }],
                      },
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </Animated.View>
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
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 10,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.navy,
    lineHeight: 33,
    marginBottom: 28,
  },
  optionsWrap: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 18,
    paddingHorizontal: 18,
    paddingLeft: 20,
    gap: 14,
    minHeight: 68,
    overflow: 'hidden' as const,
  },
  accentBar: {
    position: 'absolute' as const,
    left: 0,
    top: 8,
    bottom: 8,
    borderRadius: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
    lineHeight: 22,
  },
  optionLabelActive: {
    color: Colors.navy,
  },
  optionDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 2,
    lineHeight: 18,
  },
  optionDescActive: {
    color: Colors.darkGray,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  radioOuterActive: {
    borderColor: Colors.navy,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.navy,
  },
});
